import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.user_list_book
ADD COLUMN last_updated timestamptz NOT NULL DEFAULT NOW();
ALTER TABLE public.user_list_book
ALTER COLUMN last_updated DROP DEFAULT;

ALTER TABLE public.user_list_series
ADD COLUMN score integer;

ALTER TABLE public.user_list_series
ADD COLUMN started date;

ALTER TABLE public.user_list_series
ADD COLUMN finished date;

ALTER TABLE public.user_list_series
ADD COLUMN last_updated timestamptz NOT NULL DEFAULT NOW();
ALTER TABLE public.user_list_series
ALTER COLUMN last_updated DROP DEFAULT;

ALTER TABLE public.user_list_series
ADD COLUMN notes text NOT NULL DEFAULT '';
ALTER TABLE public.user_list_series
ALTER COLUMN notes DROP DEFAULT;
`.execute(db);
}
