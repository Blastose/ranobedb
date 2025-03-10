import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.staff
ADD COLUMN bookwalker_gl_id integer;
ALTER TABLE public.staff_hist
ADD COLUMN bookwalker_gl_id integer;
`.execute(db);
}
