import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.auth_user
ADD COLUMN behavior_settings JSONB NOT NULL DEFAULT '{"reading_dates":{"auto_fill_finished_date":false,"auto_fill_started_date":false,"clear_dates_plan_to_read":false,"clear_dates_stalled_dropped_other":false}}'::jsonb;
`.execute(db);
}
