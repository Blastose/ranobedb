import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.book
ADD COLUMN c_release_dates jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.book_hist
ADD COLUMN c_release_dates jsonb NOT NULL DEFAULT '{}'::jsonb;

WITH a AS
  (SELECT b.id,
          min(r.release_date) AS mr,
          lang
   FROM book b
   INNER JOIN release_book rb ON rb.book_id = b.id
   INNER JOIN release r ON r.id = rb.release_id
   WHERE r.hidden = FALSE
   GROUP BY b.id,
            r.lang
   ORDER BY b.id),
     b AS
  (SELECT a.id,
          jsonb_object_agg(a.lang, a.mr) AS "release_dates"
   FROM a
   GROUP BY a.id)
UPDATE public.book
SET c_release_dates = b.release_dates
FROM b
WHERE b.id = book.id
`.execute(db);
}
