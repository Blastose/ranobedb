import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.user_list_series
ADD COLUMN notify_when_released boolean NOT NULL DEFAULT false;

ALTER TABLE public.user_list_series
ALTER COLUMN notify_when_released DROP DEFAULT;

ALTER TABLE public.user_list_settings
ALTER COLUMN default_series_settings SET DEFAULT '{"formats": [], "langs": ["en"], "notify_book": true, "notify_when_released": false, "readingStatus": "Reading", "show_upcoming": true}'::jsonb;

UPDATE public.user_list_settings
SET default_series_settings['notify_when_released'] = to_jsonb(false);
`.execute(db);
}
