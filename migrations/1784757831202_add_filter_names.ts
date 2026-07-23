import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.saved_filter
ADD name text NOT NULL DEFAULT 'Default';

ALTER TABLE public.saved_filter
ALTER COLUMN name DROP DEFAULT;

ALTER TABLE public.saved_filter
DROP CONSTRAINT saved_filter_pkey;

ALTER TABLE public.saved_filter
ADD CONSTRAINT saved_filter_pkey PRIMARY KEY (user_id, item_name, is_list, name);
`.execute(db);
}
