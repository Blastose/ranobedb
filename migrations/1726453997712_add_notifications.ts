import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TYPE list_release_status ADD VALUE 'notify';

DROP TABLE public.notification;

CREATE TABLE public.notification (
	id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	notification_type text NOT NULL,
	message text NOT NULL,
	sent timestamptz NOT NULL DEFAULT NOW(),
	user_id text NOT NULL,
	is_read boolean NOT NULL,
	hidden boolean NOT NULL,
	url text NOT NULL,
	image_filename text,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);
`.execute(db);
}
