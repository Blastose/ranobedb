import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.auth_user
ADD COLUMN private boolean NOT NULL DEFAULT false;
`.execute(db);
}
