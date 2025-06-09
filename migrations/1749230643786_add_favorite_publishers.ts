import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.user_list_publisher (
	publisher_id integer NOT NULL,
	added timestamptz NOT NULL DEFAULT NOW(),
	user_id text NOT NULL,
	FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
	FOREIGN KEY (publisher_id) REFERENCES public.publisher(id),
	PRIMARY KEY (user_id, publisher_id)
);
`.execute(db);
}
