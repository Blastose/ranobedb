import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.change ADD UNIQUE (item_name, item_id, revision);
`.execute(db);
}
