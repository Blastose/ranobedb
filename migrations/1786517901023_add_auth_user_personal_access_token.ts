import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	sql`
CREATE TABLE public.auth_user_personal_access_token (
    regenerated_at timestamptz NOT NULL DEFAULT NOW(),
    user_id text NOT NULL PRIMARY KEY,
    personal_access_token text NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id) ON DELETE CASCADE
);
`.execute(db);
}
