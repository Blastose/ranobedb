import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN c_latest_release_date integer NOT NULL DEFAULT 99999999;

ALTER TABLE public.series_hist
ADD COLUMN c_latest_release_date integer NOT NULL DEFAULT 99999999;

WITH series_r AS
  (SELECT s.id,
          max(b.c_release_date) AS latest_release_date
   FROM series s
   INNER JOIN series_book sb ON sb.series_id = s.id
   INNER JOIN book b ON b.id = sb.book_id
   GROUP BY s.id)
UPDATE public.series
SET c_latest_release_date = series_r.latest_release_date
FROM series_r
WHERE series.id = series_r.id;

ALTER TABLE public.series
ALTER COLUMN c_latest_release_date DROP DEFAULT;
`.execute(db);
}
