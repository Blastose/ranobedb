import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
DROP INDEX book_title_title_trgm_idx;
DROP INDEX book_title_romaji_trgm_idx;
DROP INDEX series_title_title_trgm_idx;
DROP INDEX series_title_romaji_trgm_idx;
DROP INDEX release_title_trgm_idx;
DROP INDEX release_romaji_trgm_idx;

CREATE INDEX book_title_title_trgm_idx ON book_title USING GIN (title gin_trgm_ops);
CREATE INDEX book_title_romaji_trgm_idx ON book_title USING GIN (romaji gin_trgm_ops);

CREATE INDEX series_title_title_trgm_idx ON series_title USING GIN (title gin_trgm_ops);
CREATE INDEX series_title_romaji_trgm_idx ON series_title USING GIN (romaji gin_trgm_ops);

CREATE INDEX release_title_trgm_idx ON release USING GIN (title gin_trgm_ops);
CREATE INDEX release_romaji_trgm_idx ON release USING GIN (romaji gin_trgm_ops);
`.execute(db);
}
