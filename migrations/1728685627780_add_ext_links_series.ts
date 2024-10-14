import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.series
ADD COLUMN mal_id integer;
ALTER TABLE public.series
ADD COLUMN anilist_id integer;

ALTER TABLE public.series_hist
ADD COLUMN mal_id integer;
ALTER TABLE public.series_hist
ADD COLUMN anilist_id integer;
`.execute(db);
}
