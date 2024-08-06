import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE INDEX IF NOT EXISTS staff_alias_hist_change_id_idx ON public.staff_alias_hist (change_id);
`.execute(db);
}
