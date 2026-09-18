import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.release
ADD COLUMN image_id integer REFERENCES public.image(id);

ALTER TABLE public.release_hist
ADD COLUMN image_id integer REFERENCES public.image(id);

ALTER TABLE public.book
ADD COLUMN c_image_id integer REFERENCES public.image(id);
`.execute(db);
}
