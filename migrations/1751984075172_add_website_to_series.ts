import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN website text;

ALTER TABLE public.series_hist
ADD COLUMN website text;
`.execute(db);
}
