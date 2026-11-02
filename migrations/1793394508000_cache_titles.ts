import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`LOCK TABLE book_title, series_title IN SHARE ROW EXCLUSIVE MODE`.execute(db);

	for (const item of ['book', 'series']) {
		const table = sql.table(item);
		const titles = sql.table(`${item}_title`);
		const id = sql.id(`${item}_id`);
		const fn = sql.id(`sync_${item}_titles_cache`);
		const trigger = sql.id(`${item}_titles_cache`);

		await sql`ALTER TABLE ${table} ADD COLUMN titles jsonb NOT NULL DEFAULT '{}'::jsonb`.execute(
			db,
		);
		await sql`UPDATE ${table} AS item SET titles = cached_titles.value
			FROM (SELECT ${id} AS id, jsonb_object_agg(lang::text,
				jsonb_build_object('title', title, 'romaji', romaji, 'official', official)) AS value
				FROM ${titles} GROUP BY ${id}) AS cached_titles
			WHERE item.id = cached_titles.id`.execute(db);

		await sql`CREATE FUNCTION ${fn}() RETURNS trigger LANGUAGE plpgsql AS $$
		BEGIN
			IF TG_OP = 'TRUNCATE' THEN
				UPDATE ${table} SET titles = '{}'::jsonb;
				RETURN NULL;
			END IF;
			IF TG_OP = 'UPDATE' AND NEW IS NOT DISTINCT FROM OLD THEN
				RETURN NULL;
			END IF;
			IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND
				(OLD.${id}, OLD.lang) IS DISTINCT FROM (NEW.${id}, NEW.lang)) THEN
				UPDATE ${table} SET titles = titles - OLD.lang::text
				WHERE id = OLD.${id};
			END IF;
			IF TG_OP <> 'DELETE' THEN
				UPDATE ${table} SET titles = jsonb_set(titles,
					ARRAY[NEW.lang::text], jsonb_build_object('title', NEW.title,
						'romaji', NEW.romaji, 'official', NEW.official))
				WHERE id = NEW.${id};
			END IF;
			RETURN NULL;
		END;
		$$`.execute(db);
		await sql`CREATE TRIGGER ${trigger} AFTER INSERT OR UPDATE OR DELETE ON ${titles}
			FOR EACH ROW EXECUTE FUNCTION ${fn}()`.execute(db);
		await sql`CREATE TRIGGER ${sql.id(`${item}_titles_cache_truncate`)} AFTER TRUNCATE ON ${titles}
			FOR EACH STATEMENT EXECUTE FUNCTION ${fn}()`.execute(db);
	}
	await sql`ANALYZE book, series`.execute(db);
}
