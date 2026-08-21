import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.release
ADD COLUMN duration integer;

ALTER TABLE public.release_hist
ADD COLUMN duration integer;
`.execute(db);
}
