import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TYPE public.tag_type AS ENUM ('genre', 'demographic', 'content', 'tag'); 

CREATE TABLE public.tag (
	id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name text NOT NULL UNIQUE,
	ttype public.tag_type NOT NULL,
	description text
);

CREATE TABLE public.series_tag (
	series_id integer NOT NULL,
	tag_id integer NOT NULL,
	FOREIGN KEY (series_id) REFERENCES public.series(id),
	FOREIGN KEY (tag_id) REFERENCES public.tag(id),
	PRIMARY KEY (series_id, tag_id)
);

CREATE TABLE public.series_tag_hist (
	change_id integer NOT NULL,
	tag_id integer NOT NULL,
	FOREIGN KEY (change_id) REFERENCES public.change(id),
	FOREIGN KEY (tag_id) REFERENCES public.tag(id),
	PRIMARY KEY (change_id, tag_id)
);
`.execute(db);
}
