import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.user_list_settings (
	user_id text NOT NULL,
	default_series_settings JSONB NOT NULL DEFAULT '{"formats": [], "langs": ["en"], "notify_book": false, "readingStatus": "Reading", "show_upcoming": true}'::jsonb,
	default_book_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
	default_release_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
	PRIMARY KEY (user_id)
);

INSERT INTO public.user_list_settings (user_id)
SELECT id as user_id FROM public.auth_user;
`.execute(db);
}
