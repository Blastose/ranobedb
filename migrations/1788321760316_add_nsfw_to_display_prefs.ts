import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
ALTER TABLE public.auth_user
ALTER COLUMN display_prefs SET DEFAULT '{"names": "romaji","title_prefs": [ { "lang": "en", "romaji": false, "official": "official" }, { "lang": "ja", "romaji": true, "official": "official" } ],"descriptions": "en","label_badge_display": true,"show_nsfw": false}'::jsonb;

UPDATE auth_user
SET display_prefs['show_nsfw'] = to_jsonb(false);
	`.execute(db);
}
