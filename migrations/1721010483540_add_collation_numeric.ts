import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE COLLATION numeric (provider = icu, locale = 'en-u-kn-true');
`.execute(db);
}
