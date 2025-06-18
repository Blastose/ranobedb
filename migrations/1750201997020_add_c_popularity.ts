import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN c_popularity integer NOT NULL DEFAULT 0;

ALTER TABLE public.series_hist
ADD COLUMN c_popularity integer NOT NULL DEFAULT 0;

WITH series_r AS
  (SELECT s.id,
          COUNT(s.id) as pop
   FROM series s
   INNER JOIN user_list_series ON user_list_series.series_id = s.id
   GROUP BY s.id)
UPDATE public.series
SET c_popularity = series_r.pop
FROM series_r
WHERE series.id = series_r.id;
`.execute(db);
}
