import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.user_list_staff (
	staff_id integer NOT NULL,
	added timestamptz NOT NULL DEFAULT NOW(),
	show_upcoming boolean NOT NULL,
	notify_book boolean NOT NULL,
	only_first_book boolean NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
	FOREIGN KEY (staff_id) REFERENCES public.staff(id),
	PRIMARY KEY (user_id, staff_id)
);

CREATE TABLE public.user_list_staff_lang (
	staff_id integer NOT NULL,
	lang public.language NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id, staff_id) REFERENCES public.user_list_staff(user_id, staff_id),
	PRIMARY KEY (user_id, staff_id, lang)
);

CREATE TABLE public.user_list_staff_format (
	staff_id integer NOT NULL,
	format public.release_format NOT NULL,
	user_id text NOT NULL,
	FOREIGN KEY (user_id, staff_id) REFERENCES public.user_list_staff(user_id, staff_id),
	PRIMARY KEY (user_id, staff_id, format)
);
`.execute(db);
}
