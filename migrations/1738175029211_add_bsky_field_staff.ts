import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.staff
ADD COLUMN bsky_id text;
ALTER TABLE public.staff_hist
ADD COLUMN bsky_id text;
`.execute(db);
}
