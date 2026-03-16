import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.auth_user
ALTER COLUMN display_prefs SET DEFAULT '{"names": "romaji","title_prefs": [ { "lang": "en", "romaji": false }, { "lang": "ja", "romaji": true } ],"descriptions": "en","label_badge_display": true}'::jsonb;

UPDATE public.auth_user
SET display_prefs['label_badge_display'] = to_jsonb(true);
`.execute(db);
}
