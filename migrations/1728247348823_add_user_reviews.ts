import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.user_book_review (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id integer NOT NULL,
    last_updated timestamptz NOT NULL,
    created timestamptz NOT NULL default NOW(),
    spoiler boolean NOT NULL,
    user_id text NOT NULL,
    review_text text NOT NULL,
    score integer,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    UNIQUE (user_id, book_id)
);

CREATE TABLE public.user_series_review (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    series_id integer NOT NULL,
    last_updated timestamptz NOT NULL,
    created timestamptz NOT NULL default NOW(),
    spoiler boolean NOT NULL,
    user_id text NOT NULL,
    review_text text NOT NULL,
    score integer,
    volumes_read integer,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (series_id) REFERENCES public.series(id),
    UNIQUE (user_id, series_id)
);
	`.execute(db);
}
