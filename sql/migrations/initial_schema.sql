--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: book_format; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.book_format AS ENUM (
    'digital',
    'print'
);


--
-- Name: language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.language AS ENUM (
    'en',
    'jp'
);


--
-- Name: publisher_rel_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publisher_rel_type AS ENUM (
    'imprint',
    'subsidiary',
    'label'
);


--
-- Name: role_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role_type AS ENUM (
    'author',
    'artist'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_key; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_key (
    id text NOT NULL,
    user_id uuid NOT NULL,
    primary_key boolean NOT NULL,
    hashed_password text,
    expires bigint
);


--
-- Name: auth_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_session (
    id text NOT NULL,
    user_id uuid NOT NULL,
    active_expires bigint NOT NULL,
    idle_expires bigint NOT NULL
);


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user (
    reader_id integer NOT NULL,
    username text NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    CONSTRAINT reader_name_chk CHECK ((char_length(username) <= 25))
);


--
-- Name: book; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book (
    id integer NOT NULL,
    title text NOT NULL,
    title_romaji text,
    volume character varying(100),
    release_date timestamp with time zone,
    description text,
    book_publisher text,
    book_label text,
    bookbookwalkerlink text,
    cover_image_file_name text,
    description_markdown text,
    CONSTRAINT book_description_chk CHECK ((char_length(description) <= 5000)),
    CONSTRAINT book_publisher_chk CHECK ((char_length(book_publisher) <= 5000)),
    CONSTRAINT book_title_chk CHECK ((char_length(title) <= 255)),
    CONSTRAINT book_title_romaji_chk CHECK ((char_length(title_romaji) <= 255)),
    CONSTRAINT booklabel_chk CHECK ((char_length(book_label) <= 255)),
    CONSTRAINT bw_chk CHECK ((char_length(bookbookwalkerlink) <= 255)),
    CONSTRAINT cover_image_name_chk CHECK ((char_length(cover_image_file_name) <= 255))
);


--
-- Name: book_book_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.book ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.book_book_id_seq
    START WITH 5000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: book_info; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.book_info AS
SELECT
    NULL::integer AS id,
    NULL::text AS title,
    NULL::text AS title_romaji,
    NULL::character varying(100) AS volume,
    NULL::text AS description,
    NULL::text AS cover_image_file_name,
    NULL::date AS release_date,
    NULL::jsonb AS publisher,
    NULL::jsonb AS authors,
    NULL::jsonb AS artists;


--
-- Name: book_release_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_release_rel (
    release_id integer NOT NULL,
    book_id integer NOT NULL
);


--
-- Name: book_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_series (
    id integer NOT NULL,
    title text,
    title_romaji text,
    CONSTRAINT series_name_chk CHECK ((char_length(title) <= 255)),
    CONSTRAINT series_name_romaji_chk CHECK ((char_length(title_romaji) <= 255))
);


--
-- Name: book_series_series_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.book_series ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.book_series_series_id_seq
    START WITH 4000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: part_of; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_of (
    book_id integer NOT NULL,
    series_id integer NOT NULL
);


--
-- Name: person; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person (
    person_id integer NOT NULL,
    person_name text NOT NULL,
    person_name_romaji text,
    person_description text,
    person_description_markdown text,
    CONSTRAINT person_desc_chk CHECK ((char_length(person_description) <= 5000)),
    CONSTRAINT person_name_chk CHECK ((char_length(person_name) <= 255)),
    CONSTRAINT person_name_romaji_chk CHECK ((char_length(person_name_romaji) <= 255))
);


--
-- Name: person_book_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_book_rel (
    person_id integer NOT NULL,
    book_id integer NOT NULL,
    role public.role_type NOT NULL
);


--
-- Name: person_person_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.person ALTER COLUMN person_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.person_person_id_seq
    START WITH 3000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: publisher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publisher (
    id integer NOT NULL,
    name text,
    name_romaji text,
    description text,
    description_markdown text,
    CONSTRAINT pub_desc_ckh CHECK ((char_length(description) <= 5000)),
    CONSTRAINT pub_name_chk CHECK ((char_length(name) <= 255)),
    CONSTRAINT pub_name_romaji_chk CHECK ((char_length(name) <= 255))
);


--
-- Name: publisher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.publisher ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.publisher_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: publisher_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publisher_rel (
    id_parent integer NOT NULL,
    id_child integer NOT NULL,
    type public.publisher_rel_type NOT NULL
);


--
-- Name: publisher_release_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publisher_release_rel (
    publisher_id integer NOT NULL,
    release_id integer NOT NULL
);


--
-- Name: reader_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reader_labels (
    label_name text NOT NULL,
    book_id integer NOT NULL,
    reader_id integer NOT NULL
);


--
-- Name: reader_reader_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_user ALTER COLUMN reader_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reader_reader_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reading_list_label; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_list_label (
    label_id integer NOT NULL,
    label_name text,
    CONSTRAINT label_name_chk CHECK ((char_length(label_name) <= 255))
);


--
-- Name: reading_list_label_label_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reading_list_label ALTER COLUMN label_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reading_list_label_label_id_seq
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reads (
    reader_id integer NOT NULL,
    book_id integer NOT NULL,
    start_date date,
    finish_date date,
    added_date timestamp with time zone
);


--
-- Name: release; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.release (
    id integer NOT NULL,
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


--
-- Name: release_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.release ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.release_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);


--
-- Name: book_release_rel book_release_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_release_rel
    ADD CONSTRAINT book_release_rel_pkey PRIMARY KEY (release_id, book_id);


--
-- Name: book_series book_series_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_series
    ADD CONSTRAINT book_series_pkey PRIMARY KEY (id);


--
-- Name: auth_key key_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_key
    ADD CONSTRAINT key_pkey PRIMARY KEY (id);


--
-- Name: part_of part_of_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_of
    ADD CONSTRAINT part_of_pkey PRIMARY KEY (book_id, series_id);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- Name: publisher publisher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT publisher_pkey PRIMARY KEY (id);


--
-- Name: publisher_rel publisher_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher_rel
    ADD CONSTRAINT publisher_rel_pkey PRIMARY KEY (id_parent, id_child);


--
-- Name: publisher_release_rel publisher_release_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher_release_rel
    ADD CONSTRAINT publisher_release_rel_pkey PRIMARY KEY (publisher_id, release_id);


--
-- Name: reader_labels reader_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reader_labels
    ADD CONSTRAINT reader_labels_pkey PRIMARY KEY (label_name, book_id, reader_id);


--
-- Name: auth_user reader_name_unq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT reader_name_unq UNIQUE (username);


--
-- Name: auth_user reader_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT reader_pkey PRIMARY KEY (reader_id);


--
-- Name: reading_list_label reading_list_label_label_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_label
    ADD CONSTRAINT reading_list_label_label_name_key UNIQUE (label_name);


--
-- Name: reading_list_label reading_list_label_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_label
    ADD CONSTRAINT reading_list_label_pkey PRIMARY KEY (label_id);


--
-- Name: reads reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reads
    ADD CONSTRAINT reads_pkey PRIMARY KEY (reader_id, book_id);


--
-- Name: release release_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release
    ADD CONSTRAINT release_pkey PRIMARY KEY (id);


--
-- Name: auth_session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: auth_user user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT user_id_key UNIQUE (id);


--
-- Name: person_book_rel writes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_book_rel
    ADD CONSTRAINT writes_pkey PRIMARY KEY (person_id, book_id, role);


--
-- Name: book_info _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.book_info AS
 SELECT b.id,
    b.title,
    b.title_romaji,
    b.volume,
    b.description,
    b.cover_image_file_name,
    min(r.release_date) AS release_date,
    COALESCE(jsonb_agg(DISTINCT jsonb_build_object('name', p.name, 'id', p.id)) FILTER (WHERE (p.id IS NOT NULL)), '[]'::jsonb) AS publisher,
    COALESCE(jsonb_agg(DISTINCT jsonb_build_object('name', author.person_name, 'id', pbr_author.person_id)) FILTER (WHERE (author.person_name IS NOT NULL)), '[]'::jsonb) AS authors,
    COALESCE(jsonb_agg(DISTINCT jsonb_build_object('name', artist.person_name, 'id', pbr_artist.person_id)) FILTER (WHERE (artist.person_name IS NOT NULL)), '[]'::jsonb) AS artists
   FROM ((((((((public.book b
     LEFT JOIN public.book_release_rel brr ON ((b.id = brr.book_id)))
     LEFT JOIN public.release r ON ((r.id = brr.release_id)))
     LEFT JOIN public.publisher_release_rel prr ON ((prr.release_id = r.id)))
     LEFT JOIN public.publisher p ON ((p.id = prr.publisher_id)))
     LEFT JOIN public.person_book_rel pbr_author ON (((pbr_author.book_id = b.id) AND (pbr_author.role = 'author'::public.role_type))))
     LEFT JOIN public.person_book_rel pbr_artist ON (((pbr_artist.book_id = b.id) AND (pbr_artist.role = 'artist'::public.role_type))))
     LEFT JOIN public.person author ON ((author.person_id = pbr_author.person_id)))
     LEFT JOIN public.person artist ON ((artist.person_id = pbr_artist.person_id)))
  GROUP BY b.id;


--
-- Name: book_release_rel book_release_rel_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_release_rel
    ADD CONSTRAINT book_release_rel_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(id);


--
-- Name: book_release_rel book_release_rel_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_release_rel
    ADD CONSTRAINT book_release_rel_release_id_fkey FOREIGN KEY (release_id) REFERENCES public.release(id);


--
-- Name: auth_key key_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_key
    ADD CONSTRAINT key_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_user(id);


--
-- Name: part_of part_of_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_of
    ADD CONSTRAINT part_of_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(id);


--
-- Name: part_of part_of_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_of
    ADD CONSTRAINT part_of_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.book_series(id);


--
-- Name: publisher_rel publisher_rel_id_child_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher_rel
    ADD CONSTRAINT publisher_rel_id_child_fkey FOREIGN KEY (id_child) REFERENCES public.publisher(id);


--
-- Name: publisher_rel publisher_rel_id_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher_rel
    ADD CONSTRAINT publisher_rel_id_parent_fkey FOREIGN KEY (id_parent) REFERENCES public.publisher(id);


--
-- Name: publisher_release_rel publisher_release_rel_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher_release_rel
    ADD CONSTRAINT publisher_release_rel_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publisher(id);


--
-- Name: publisher_release_rel publisher_release_rel_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publisher_release_rel
    ADD CONSTRAINT publisher_release_rel_release_id_fkey FOREIGN KEY (release_id) REFERENCES public.release(id);


--
-- Name: reader_labels reader_labels_label_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reader_labels
    ADD CONSTRAINT reader_labels_label_name_fkey FOREIGN KEY (label_name) REFERENCES public.reading_list_label(label_name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reader_labels reader_labels_reader_id_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reader_labels
    ADD CONSTRAINT reader_labels_reader_id_book_id_fkey FOREIGN KEY (reader_id, book_id) REFERENCES public.reads(reader_id, book_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reads reads_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reads
    ADD CONSTRAINT reads_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(id);


--
-- Name: reads reads_reader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reads
    ADD CONSTRAINT reads_reader_id_fkey FOREIGN KEY (reader_id) REFERENCES public.auth_user(reader_id) ON DELETE CASCADE;


--
-- Name: auth_session session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_user(id);


--
-- Name: person_book_rel writes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_book_rel
    ADD CONSTRAINT writes_author_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(person_id);


--
-- Name: person_book_rel writes_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_book_rel
    ADD CONSTRAINT writes_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(id);


--
-- PostgreSQL database dump complete
--

