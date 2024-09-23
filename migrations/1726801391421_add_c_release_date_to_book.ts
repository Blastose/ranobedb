import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.book
ADD COLUMN c_release_date integer;

ALTER TABLE public.book_hist
ADD COLUMN c_release_date integer NOT NULL DEFAULT 99999999;

UPDATE public.book
SET c_release_date = release_date;

ALTER TABLE public.book
ALTER COLUMN c_release_date SET NOT NULL;
`.execute(db);
}
