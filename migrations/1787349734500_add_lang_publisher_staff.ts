import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.publisher ADD COLUMN lang public.language;
ALTER TABLE public.publisher_hist ADD COLUMN lang public.language;
ALTER TABLE public.staff ADD COLUMN lang public.language;
ALTER TABLE public.staff_hist ADD COLUMN lang public.language;
	`.execute(db);

	// Backfill publisher.lang with the most common release.lang from releases linked to each publisher
	await sql`
WITH ranked AS (
	SELECT DISTINCT ON (rp.publisher_id)
		rp.publisher_id AS publisher_id,
		r.lang AS lang
	FROM public.release_publisher rp
	INNER JOIN public.release r ON r.id = rp.release_id
	WHERE r.lang IS NOT NULL
	GROUP BY rp.publisher_id, r.lang
	ORDER BY rp.publisher_id, COUNT(*) DESC
)
UPDATE public.publisher p
SET lang = ranked.lang
FROM ranked
WHERE p.id = ranked.publisher_id;
	`.execute(db);

	// Backfill staff.lang with the most common book_edition.lang from books linked to each staff
	// Note: book_edition.lang can be null which is inferred to be Japanese
	await sql`
WITH ranked AS (
	SELECT DISTINCT ON (sa.staff_id)
		sa.staff_id AS staff_id,
		COALESCE(be.lang, 'ja'::public.language) AS lang
	FROM public.staff_alias sa
	INNER JOIN public.book_staff_alias bsa ON bsa.staff_alias_id = sa.id
	INNER JOIN public.book_edition be ON be.book_id = bsa.book_id AND be.eid = bsa.eid
	GROUP BY sa.staff_id, COALESCE(be.lang, 'ja'::public.language)
	ORDER BY sa.staff_id, COUNT(*) DESC
)
UPDATE public.staff s
SET lang = ranked.lang
FROM ranked
WHERE s.id = ranked.staff_id;
	`.execute(db);

	// Default any remaining nulls in the real tables to Japanese
	await sql`
UPDATE public.publisher SET lang = 'ja'::public.language WHERE lang IS NULL;
UPDATE public.staff SET lang = 'ja'::public.language WHERE lang IS NULL;
	`.execute(db);

	// Fill _hist tables lang from the real tables
	await sql`
UPDATE public.publisher_hist
SET lang = p.lang
FROM public.publisher p, public.change c
WHERE c.id = public.publisher_hist.change_id
AND c.item_id = p.id
AND c.item_name = 'publisher';
	`.execute(db);

	await sql`
UPDATE public.staff_hist
SET lang = s.lang
FROM public.staff s, public.change c
WHERE c.id = public.staff_hist.change_id
AND c.item_id = s.id
AND c.item_name = 'staff';
	`.execute(db);

	// Set NOT NULL constraints
	await sql`
ALTER TABLE public.publisher ALTER COLUMN lang SET NOT NULL;
ALTER TABLE public.publisher_hist ALTER COLUMN lang SET NOT NULL;
ALTER TABLE public.staff ALTER COLUMN lang SET NOT NULL;
ALTER TABLE public.staff_hist ALTER COLUMN lang SET NOT NULL;
	`.execute(db);
}
