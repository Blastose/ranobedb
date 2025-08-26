import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.profile_image (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    width integer NOT NULL,
    height integer NOT NULL,
    spoiler boolean NOT NULL,
    filename text NOT NULL
);

ALTER TABLE public.auth_user
ADD COLUMN profile_image_id integer REFERENCES profile_image(id);
`.execute(db);
}
