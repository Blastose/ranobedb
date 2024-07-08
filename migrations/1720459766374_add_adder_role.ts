import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
	ALTER TYPE public.user_role ADD VALUE 'adder' AFTER 'moderator';
`.execute(db);
}
