CREATE TYPE public.book_format AS ENUM ('digital', 'print', 'audio');

CREATE TYPE public.language AS ENUM ('en', 'jp');

CREATE TYPE public.publisher_rel_type AS ENUM (
    'imprint',
    'subsidiary',
    'label'
);

CREATE TYPE public.role_type AS ENUM ('author', 'artist');

CREATE TYPE public.user_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.auth_key (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    primary_key boolean NOT NULL,
    hashed_password text,
    expires bigint,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.auth_session (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    active_expires bigint NOT NULL,
    idle_expires bigint NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.auth_user (
    reader_id integer GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
    username text NOT NULL UNIQUE,
    id uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    CONSTRAINT reader_name_chk CHECK ((char_length(username) <= 25))
);

CREATE TABLE public.book (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    title_romaji text,
    volume character varying(100),
    description text,
    bookbookwalkerlink text,
    cover_image_file_name text,
    description_markdown text,
    CONSTRAINT book_description_chk CHECK ((char_length(description) <= 5000)),
    CONSTRAINT book_title_chk CHECK ((char_length(title) <= 255)),
    CONSTRAINT book_title_romaji_chk CHECK ((char_length(title_romaji) <= 255)),
    CONSTRAINT bw_chk CHECK ((char_length(bookbookwalkerlink) <= 255)),
    CONSTRAINT cover_image_name_chk CHECK ((char_length(cover_image_file_name) <= 255))
);

CREATE TABLE public.book_release (
    release_id integer NOT NULL,
    book_id integer NOT NULL,
    FOREIGN KEY (release_id) REFERENCES public.release(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (release_id, book_id)
);

CREATE TABLE public.book_series (
    book_id integer NOT NULL,
    series_id integer NOT NULL,
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    FOREIGN KEY (series_id) REFERENCES public.series(id),
    PRIMARY KEY (book_id, series_id)
);

CREATE TABLE public.person (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
    name text NOT NULL,
    name_romaji text,
    description text,
    description_markdown text,
    CONSTRAINT person_desc_chk CHECK ((char_length(description) <= 5000)),
    CONSTRAINT person_name_chk CHECK ((char_length(name) <= 255)),
    CONSTRAINT person_name_romaji_chk CHECK ((char_length(name_romaji) <= 255))
);

CREATE TABLE public.person_book (
    person_id integer NOT NULL,
    book_id integer NOT NULL,
    role public.role_type NOT NULL,
    FOREIGN KEY (person_id) REFERENCES public.person(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (person_id, book_id, role)
);

CREATE TABLE public.publisher (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
    name text NOT NULL,
    name_romaji text,
    description text,
    description_markdown text,
    CONSTRAINT pub_desc_ckh CHECK ((char_length(description) <= 5000)),
    CONSTRAINT pub_name_chk CHECK ((char_length(name) <= 255)),
    CONSTRAINT pub_name_romaji_chk CHECK ((char_length(name) <= 255))
);

CREATE TABLE public.publisher_relation (
    id_parent integer NOT NULL,
    id_child integer NOT NULL,
    type public.publisher_rel_type NOT NULL,
    FOREIGN KEY (id_parent) REFERENCES public.publisher(id),
    FOREIGN KEY (id_child) REFERENCES public.publisher(id),
    PRIMARY KEY (id_parent, id_child)
);

CREATE TABLE public.publisher_release (
    publisher_id integer NOT NULL,
    release_id integer NOT NULL,
    FOREIGN KEY (publisher_id) REFERENCES public.publisher(id),
    FOREIGN KEY (release_id) REFERENCES public.release(id),
    PRIMARY KEY (publisher_id, release_id)
);

CREATE TABLE public.reader_labels (
    label_name text NOT NULL,
    book_id integer NOT NULL,
    reader_id integer NOT NULL,
    FOREIGN KEY (label_name) REFERENCES public.reading_list_label(label_name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (reader_id, book_id) REFERENCES public.reads(reader_id, book_id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (label_name, book_id, reader_id)
);

CREATE TABLE public.reading_list_label (
    label_id integer GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
    label_name text UNIQUE,
    CONSTRAINT label_name_chk CHECK ((char_length(label_name) <= 255))
);

CREATE TABLE public.reads (
    reader_id integer NOT NULL,
    book_id integer NOT NULL,
    start_date date,
    finish_date date,
    added_date timestamp with time zone,
    FOREIGN KEY (reader_id) REFERENCES public.auth_user(reader_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (reader_id, book_id)
);

CREATE TABLE public.release (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
    name text NOT NULL,
    name_romaji text,
    format public.book_format NOT NULL,
    lang public.language NOT NULL,
    release_date date,
    isbn13 character varying(20),
    description text,
    CONSTRAINT desc_chk CHECK ((char_length(description) <= 5000)),
    CONSTRAINT rel_name_chk CHECK ((char_length(name) <= 255)),
    CONSTRAINT rel_name_romaji_chk CHECK ((char_length(name_romaji) <= 255))
);

CREATE TABLE public.series (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
    title text NOT NULL,
    title_romaji text,
    CONSTRAINT series_name_chk CHECK ((char_length(title) <= 255)),
    CONSTRAINT series_name_romaji_chk CHECK ((char_length(title_romaji) <= 255))
);