import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN c_start_date integer;
ALTER TABLE public.series
ADD COLUMN c_end_date integer;

ALTER TABLE public.series_hist
ADD COLUMN c_start_date integer NOT NULL DEFAULT 99999999;
ALTER TABLE public.series_hist
ADD COLUMN c_end_date integer NOT NULL DEFAULT 99999999;

UPDATE public.series
SET c_start_date = start_date,
    c_end_date   = end_date;

ALTER TABLE public.series
ALTER COLUMN c_start_date SET NOT NULL;
ALTER TABLE public.series
ALTER COLUMN c_end_date SET NOT NULL;
`.execute(db);
}
