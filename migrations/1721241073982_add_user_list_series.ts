import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.notification (
	id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	sent timestamptz NOT NULL DEFAULT NOW(),
	is_read boolean NOT NULL,
	hidden boolean NOT NULL,
	notification_type text NOT NULL,
	message text NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.user_list_series (
	series_id integer NOT NULL,
	volumes_read integer,
	added timestamptz NOT NULL DEFAULT NOW(),
	notify_book boolean NOT NULL,
	show_upcoming boolean NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
	FOREIGN KEY (series_id) REFERENCES public.series(id),
	PRIMARY KEY (user_id, series_id)
);

CREATE TABLE public.user_list_series_label (
    label_id integer NOT NULL,
    series_id integer NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, label_id) REFERENCES public.user_list_label(user_id, id),
    FOREIGN KEY (user_id, series_id) REFERENCES public.user_list_series(user_id, series_id),
    PRIMARY KEY (label_id, user_id, series_id)
);

CREATE TABLE public.user_list_series_lang (
	series_id integer NOT NULL,
	lang public.language NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id, series_id) REFERENCES public.user_list_series(user_id, series_id),
	PRIMARY KEY (user_id, series_id, lang)
);

CREATE TABLE public.user_list_series_format (
	series_id integer NOT NULL,
	format public.release_format NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id, series_id) REFERENCES public.user_list_series(user_id, series_id),
	PRIMARY KEY (user_id, series_id, format)
);
`.execute(db);
}
