import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.saved_filter
ADD is_list boolean NOT NULL DEFAULT TRUE;

ALTER TABLE public.saved_filter
ALTER COLUMN is_list DROP DEFAULT;

ALTER TABLE public.saved_filter
DROP CONSTRAINT saved_filter_pkey;

ALTER TABLE public.saved_filter
ADD CONSTRAINT saved_filter_pkey PRIMARY KEY (user_id, item_name, is_list)
`.execute(db);
}
