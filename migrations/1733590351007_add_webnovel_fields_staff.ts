import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.staff
ADD COLUMN syosetu_id integer;
ALTER TABLE public.staff_hist
ADD COLUMN syosetu_id integer;

ALTER TABLE public.staff
ADD COLUMN kakuyomu_id text;
ALTER TABLE public.staff_hist
ADD COLUMN kakuyomu_id text;
`.execute(db);
}
