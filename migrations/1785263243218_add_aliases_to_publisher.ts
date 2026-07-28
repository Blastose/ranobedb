import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.publisher
ADD COLUMN aliases text NOT NULL DEFAULT '';

ALTER TABLE public.publisher_hist
ADD COLUMN aliases text NOT NULL DEFAULT '';

ALTER TABLE public.publisher
ALTER COLUMN aliases DROP DEFAULT;

ALTER TABLE public.publisher_hist
ALTER COLUMN aliases DROP DEFAULT;
`.execute(db);
}
