import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
	CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
`.execute(db);
}
