import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TYPE public.list_label_target AS ENUM ('both', 'book', 'series');

ALTER TABLE public.user_list_label
ADD COLUMN target public.list_label_target NOT NULL DEFAULT 'both';

ALTER TABLE public.user_list_label
ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
`.execute(db);
}
