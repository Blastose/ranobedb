import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
UPDATE series
set description = '';

UPDATE series_hist
set description = '';
`.execute(db);
}
