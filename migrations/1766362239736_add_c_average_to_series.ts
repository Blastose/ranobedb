import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN c_average integer NOT NULL DEFAULT 0;

ALTER TABLE public.series_hist
ADD COLUMN c_average integer NOT NULL DEFAULT 0;
`.execute(db);
}
