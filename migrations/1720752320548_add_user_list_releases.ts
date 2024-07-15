import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TYPE public.list_release_status AS ENUM (
    'owned',
    'pending',
    'on loan',
    'deleted',
    'unknown'
);

CREATE TABLE public.user_list_release (
    added timestamptz NOT NULL DEFAULT NOW(),
    release_id integer NOT NULL,
    release_status public.list_release_status NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (release_id) REFERENCES public.release(id),
    PRIMARY KEY (user_id, release_id)
);
`.execute(db);
}
