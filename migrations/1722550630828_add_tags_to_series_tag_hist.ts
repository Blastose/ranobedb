import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
DELETE FROM series_tag_hist;

INSERT INTO series_tag_hist (change_id, tag_id) 
WITH series_with_tags AS
  (SELECT s.id
   FROM series s
   INNER JOIN series_tag st ON st.series_id = s.id
   GROUP BY s.id
   ORDER BY s.id)
SELECT sh.change_id,
       st.tag_id
FROM "change" c
INNER JOIN series_hist sh ON c.id = sh.change_id
INNER JOIN series_with_tags ON c.item_id = series_with_tags.id
INNER JOIN series_tag st ON st.series_id = series_with_tags.id
WHERE c.item_name = 'series'
`.execute(db);
}
