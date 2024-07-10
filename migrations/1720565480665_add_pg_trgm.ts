import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
	CREATE EXTENSION IF NOT EXISTS pg_trgm;
`.execute(db);
}
