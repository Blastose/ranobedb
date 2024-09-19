import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TYPE list_release_status ADD VALUE 'notify';

DROP TABLE public.notification;

CREATE TABLE public.notification (
	id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	item_id integer,
	item_name db_item,
	sent timestamptz NOT NULL DEFAULT NOW(),
	is_read boolean NOT NULL,
	hidden boolean NOT NULL,
	notification_type text NOT NULL,
	message text NOT NULL,
	user_id text NOT NULL,
	url text NOT NULL,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

ALTER TABLE public.user_list_settings
ALTER COLUMN default_series_settings SET DEFAULT '{"formats": [], "langs": ["en"], "notify_book": true, "readingStatus": "Reading", "show_upcoming": true}'::jsonb;

UPDATE public.user_list_settings
SET default_series_settings['notify_book'] = to_jsonb(true);

UPDATE public.user_list_series
SET notify_book = true
WHERE show_upcoming = true;
`.execute(db);
}
