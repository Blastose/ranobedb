import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN c_fully_translated public.language[] NOT NULL DEFAULT '{}';

ALTER TABLE public.series_hist
ADD COLUMN c_fully_translated public.language[] NOT NULL DEFAULT '{}';

WITH
  "rel" AS (
    SELECT DISTINCT
      ON ("series"."id") "series"."id" AS "series_id",
      "series_book"."sort_order",
      array(
        SELECT
          jsonb_object_keys(book.c_release_dates)
      )::LANGUAGE [] AS "langs"
    FROM
      "series"
      INNER JOIN "series_book" ON "series_book"."series_id" = "series"."id"
      INNER JOIN "book" ON "book"."id" = "series_book"."book_id"
    WHERE
      "book"."hidden" = false
      AND "series"."hidden" = false
			AND "series_book"."book_type" = 'main'
    ORDER BY
      "series"."id",
      "series_book"."sort_order" DESC
  )
UPDATE "series"
SET
  "c_fully_translated" = "rel"."langs"
FROM
  "rel"
WHERE
  "series"."id" = "rel"."series_id"
`.execute(db);
}
