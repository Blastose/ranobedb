import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE auth_user
ALTER COLUMN display_prefs
SET DEFAULT '{"names": "romaji","title_prefs": [ { "lang": "en", "romaji": false, "official": "official" }, { "lang": "ja", "romaji": true, "official": "official" } ],"descriptions": "en","label_badge_display": true}'::jsonb;
	`.execute(db);

	await sql`
UPDATE auth_user
SET display_prefs = jsonb_set(
	display_prefs,
	'{title_prefs}',
	(
		SELECT jsonb_agg(
			CASE
				WHEN item->>'official' IS NULL THEN item || '{"official": "official"}'::jsonb
				ELSE item
			END
		)
		FROM jsonb_array_elements(display_prefs->'title_prefs') AS item
	)
)
WHERE display_prefs->'title_prefs' IS NOT NULL
AND EXISTS (
	SELECT 1
	FROM jsonb_array_elements(display_prefs->'title_prefs') AS item
	WHERE item->>'official' IS NULL
);
`.execute(db);
}
