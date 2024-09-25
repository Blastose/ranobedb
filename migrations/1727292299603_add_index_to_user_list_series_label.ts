import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE INDEX IF NOT EXISTS user_list_series_label_series_id_idx ON public.user_list_series_label USING btree (series_id);
`.execute(db);
}
