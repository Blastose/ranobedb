CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE COLLATION IF NOT EXISTS numeric (provider = icu, locale = 'en-u-kn-true');

CREATE TYPE public.release_format AS ENUM ('print', 'digital', 'audio');

CREATE TYPE public.tag_type AS ENUM ('genre', 'demographic', 'content', 'tag');

CREATE TYPE public.language AS ENUM (
    'ja',
    'en',
    'zh-Hans',
    'zh-Hant',
    'fr',
    'es',
    'ko',
    'ar',
    'bg',
    'ca',
    'cs',
    'ck',
    'da',
    'de',
    'el',
    'eo',
    'eu',
    'fa',
    'fi',
    'ga',
    'gd',
    'he',
    'hi',
    'hr',
    'hu',
    'id',
    'it',
    'iu',
    'mk',
    'ms',
    'la',
    'lt',
    'lv',
    'nl',
    'no',
    'pl',
    'pt-pt',
    'pt-br',
    'ro',
    'ru',
    'sk',
    'sl',
    'sr',
    'sv',
    'ta',
    'th',
    'tr',
    'uk',
    'ur',
    'vi'
);

CREATE TYPE public.publisher_rel_type AS ENUM (
    'imprint',
    'parent brand',
    'subsidiary',
    'parent company'
);

CREATE TYPE public.series_rel_type AS ENUM (
    'prequel',
    'sequel',
    'side story',
    'main story',
    'spin-off',
    'parent story',
    'alternate version'
);

CREATE TYPE public.staff_role AS ENUM (
    'author',
    'artist',
    'editor',
    'translator',
    'staff',
    'narrator'
);

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'moderator',
    'adder',
    'editor',
    'user',
    'banned'
);

CREATE TYPE public.release_type AS ENUM ('complete', 'omnibus', 'partial');

CREATE TYPE public.release_publisher_type AS ENUM ('publisher', 'imprint');

CREATE TYPE public.series_status AS ENUM (
    'ongoing',
    'completed',
    'cancelled',
    'hiatus',
    'stalled',
    'unknown'
);

CREATE TYPE public.series_book_type AS ENUM ('main', 'sub');

CREATE TYPE public.db_item AS ENUM (
    'book',
    'series',
    'release',
    'staff',
    'publisher'
);

CREATE TYPE public.list_release_status AS ENUM (
    'owned',
    'pending',
    'on loan',
    'deleted',
    'unknown',
    'notify'
);

CREATE TYPE public.list_label_target AS ENUM ('both', 'book', 'series');

CREATE TABLE public.auth_user (
    joined timestamptz NOT NULL DEFAULT NOW(),
    id_numeric integer NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    id text NOT NULL PRIMARY KEY,
    username text NOT NULL UNIQUE,
    username_lowercase text NOT NULL UNIQUE,
    display_prefs JSONB NOT NULL default '{"names": "romaji","title_prefs": [ { "lang": "en", "romaji": false }, { "lang": "ja", "romaji": true } ],"descriptions": "en"}'::jsonb
);

CREATE TABLE public.auth_user_credentials (
    email_verified boolean NOT NULL DEFAULT false,
    user_id text NOT NULL PRIMARY KEY,
    hashed_password text NOT NULL,
    email text NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.auth_session (
    expires_at timestamptz NOT NULL,
    id text NOT NULL PRIMARY KEY,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.email_verification_code (
    expires_at timestamptz NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code text NOT NULL,
    user_id text NOT NULL UNIQUE,
    email text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.password_reset_token (
    expires_at timestamptz NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token_hash text NOT NULL UNIQUE,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.email_verification_token (
    expires_at timestamptz NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token_hash text NOT NULL UNIQUE,
    user_id text NOT NULL,
    new_email text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.notification (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id integer,
    item_name db_item,
    sent timestamptz NOT NULL DEFAULT NOW(),
    is_read boolean NOT NULL,
    hidden boolean NOT NULL,
    notification_type text NOT NULL,
    message text NOT NULL,
    user_id text NOT NULL,
    url text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.change (
    added timestamptz NOT NULL DEFAULT NOW(),
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id integer NOT NULL,
    revision integer NOT NULL,
    item_name db_item NOT NULL,
    ihid boolean NOT NULL,
    ilock boolean NOT NULL,
    user_id text NOT NULL,
    comments text NOT NULL,
    UNIQUE (item_name, item_id, revision),
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id)
);

CREATE TABLE public.image (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    width integer NOT NULL,
    height integer NOT NULL,
    spoiler boolean NOT NULL,
    nsfw boolean NOT NULL,
    filename text NOT NULL
);

-- TODO Remove release_date when all books have releases with the correct release date
CREATE TABLE public.book (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    image_id integer,
    release_date integer NOT NULL,
    c_release_date integer NOT NULL,
    olang public.language NOT NULL,
    locked boolean NOT NULL,
    hidden boolean NOT NULL,
    description_ja text NOT NULL,
    description text NOT NULL,
    FOREIGN KEY (image_id) REFERENCES public.image(id)
);

CREATE TABLE public.book_hist (
    change_id integer NOT NULL,
    image_id integer,
    release_date integer NOT NULL,
    c_release_date integer NOT NULL DEFAULT 99999999,
    olang public.language NOT NULL,
    description_ja text NOT NULL,
    description text NOT NULL,
    FOREIGN KEY (image_id) REFERENCES public.image(id),
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id)
);

CREATE TABLE public.book_title (
    book_id integer NOT NULL,
    lang public.language NOT NULL,
    official boolean NOT NULL,
    title text NOT NULL,
    romaji text,
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (book_id, lang)
);

CREATE TABLE public.book_title_hist (
    change_id integer NOT NULL,
    lang public.language NOT NULL,
    official boolean NOT NULL,
    title text NOT NULL,
    romaji text,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id, lang)
);

CREATE TABLE public.book_edition (
    book_id integer NOT NULL,
    eid integer NOT NULL,
    lang public.language,
    title text NOT NULL,
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (book_id, eid)
);

CREATE TABLE public.book_edition_hist (
    change_id integer NOT NULL,
    eid integer NOT NULL,
    lang public.language,
    title text NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id, eid)
);

CREATE TABLE public.staff (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bookwalker_id integer,
    bookwalker_gl_id integer,
    wikidata_id integer,
    pixiv_id integer,
    syosetu_id integer,
    hidden boolean NOT NULL,
    locked boolean NOT NULL,
    twitter_id text,
    kakuyomu_id text,
    bsky_id text,
    website text,
    description text NOT NULL
);

CREATE TABLE public.staff_hist (
    change_id integer NOT NULL,
    bookwalker_id integer,
    bookwalker_gl_id integer,
    wikidata_id integer,
    pixiv_id integer,
    syosetu_id integer,
    twitter_id text,
    kakuyomu_id text,
    bsky_id text,
    website text,
    description text NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id)
);

CREATE TABLE public.staff_alias (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_id integer NOT NULL,
    main_alias boolean NOT NULL,
    name text NOT NULL,
    romaji text,
    FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);

CREATE TABLE public.staff_alias_hist (
    -- "fk" to staff_alias.id; no actual fk, since we can delete staff_alias rows
    aid integer NOT NULL,
    change_id integer NOT NULL,
    main_alias boolean NOT NULL,
    name text NOT NULL,
    romaji text,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (aid, change_id)
);

CREATE TABLE public.book_staff_alias (
    book_id integer NOT NULL,
    staff_alias_id integer NOT NULL,
    eid integer not null,
    role_type public.staff_role NOT NULL,
    note text NOT NULL,
    FOREIGN KEY (eid, book_id) REFERENCES public.book_edition(eid, book_id),
    -- "fk" to staff_alias.id; no actual fk, since we can delete staff_alias rows
    -- FOREIGN KEY (staff_alias_id) REFERENCES public.staff_alias(id),
    PRIMARY KEY (staff_alias_id, book_id, eid, role_type)
);

CREATE TABLE public.book_staff_alias_hist (
    change_id integer NOT NULL,
    -- "fk" to staff_alias.id; no actual fk, since we can delete staff_alias rows
    staff_alias_id integer NOT NULL,
    -- "fk" to book_eiditon.eid; no actual fk, since we can delete book editions rows
    eid integer not null,
    role_type public.staff_role NOT NULL,
    note text NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (staff_alias_id, change_id, eid, role_type)
);

CREATE TABLE public.publisher (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    wikidata_id integer,
    locked boolean NOT NULL,
    hidden boolean NOT NULL,
    name text NOT NULL,
    romaji text,
    description text NOT NULL,
    bookwalker text,
    twitter_id text,
    website text
);

CREATE TABLE public.publisher_hist (
    change_id integer NOT NULL,
    wikidata_id integer,
    name text NOT NULL,
    romaji text,
    description text NOT NULL,
    bookwalker text,
    twitter_id text,
    website text,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id)
);

CREATE TABLE public.publisher_relation (
    id_parent integer NOT NULL,
    id_child integer NOT NULL,
    relation_type public.publisher_rel_type NOT NULL,
    FOREIGN KEY (id_parent) REFERENCES public.publisher(id),
    FOREIGN KEY (id_child) REFERENCES public.publisher(id),
    PRIMARY KEY (id_parent, id_child)
);

CREATE TABLE public.publisher_relation_hist (
    change_id integer NOT NULL,
    id_child integer NOT NULL,
    relation_type public.publisher_rel_type NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    FOREIGN KEY (id_child) REFERENCES public.publisher(id),
    PRIMARY KEY (change_id, id_child)
);

CREATE TABLE public.release (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    release_date integer NOT NULL,
    pages integer,
    format release_format NOT NULL,
    lang public.language NOT NULL,
    locked boolean NOT NULL,
    hidden boolean NOT NULL,
    description text NOT NULL,
    title text NOT NULL,
    romaji text,
    isbn13 text,
    website text,
    amazon text,
    bookwalker text,
    rakuten text
);

CREATE TABLE public.release_hist (
    change_id integer NOT NULL,
    release_date integer NOT NULL,
    pages integer,
    format release_format NOT NULL,
    lang public.language NOT NULL,
    description text NOT NULL,
    title text NOT NULL,
    romaji text,
    isbn13 text,
    website text,
    amazon text,
    bookwalker text,
    rakuten text,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id)
);

CREATE TABLE public.release_publisher (
    release_id integer NOT NULL,
    publisher_id integer NOT NULL,
    publisher_type release_publisher_type NOT NULL,
    FOREIGN KEY (release_id) REFERENCES public.release(id),
    FOREIGN KEY (publisher_id) REFERENCES public.publisher(id),
    PRIMARY KEY (release_id, publisher_id, publisher_type)
);

CREATE TABLE public.release_publisher_hist (
    change_id integer NOT NULL,
    publisher_id integer NOT NULL,
    publisher_type release_publisher_type NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    FOREIGN KEY (publisher_id) REFERENCES public.publisher(id),
    PRIMARY KEY (change_id, publisher_id, publisher_type)
);

CREATE TABLE release_book (
    release_id integer NOT NULL,
    book_id integer NOT NULL,
    rtype release_type NOT NULL,
    FOREIGN KEY (release_id) REFERENCES public.release(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (release_id, book_id)
);

CREATE TABLE release_book_hist (
    change_id integer NOT NULL,
    book_id integer NOT NULL,
    rtype release_type NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (change_id, book_id)
);

CREATE TABLE public.saved_filter (
    user_id text NOT NULL,
    item_name db_item NOT NULL,
    filters text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    PRIMARY KEY (user_id, item_name)
);

CREATE TABLE public.series (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bookwalker_id integer,
    anidb_id integer,
    mal_id integer,
    anilist_id integer,
    start_date integer NOT NULL,
    c_start_date integer NOT NULL,
    end_date integer NOT NULL,
    c_end_date integer NOT NULL,
    wikidata_id integer,
    c_num_books integer NOT NULL,
    olang public.language NOT NULL,
    publication_status series_status NOT NULL,
    locked boolean NOT NULL,
    hidden boolean NOT NULL,
    aliases text NOT NULL,
    description text NOT NULL,
    web_novel text
);

CREATE TABLE public.series_hist (
    change_id integer NOT NULL,
    bookwalker_id integer,
    anidb_id integer,
    mal_id integer,
    anilist_id integer,
    start_date integer NOT NULL,
    c_start_date integer NOT NULL DEFAULT 99999999,
    end_date integer NOT NULL,
    c_end_date integer NOT NULL DEFAULT 99999999,
    wikidata_id integer,
    olang public.language NOT NULL,
    publication_status series_status NOT NULL,
    aliases text NOT NULL,
    description text NOT NULL,
    web_novel text,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id)
);

CREATE TABLE public.series_relation (
    id_parent integer NOT NULL,
    id_child integer NOT NULL,
    relation_type public.series_rel_type NOT NULL,
    FOREIGN KEY (id_parent) REFERENCES public.series(id),
    FOREIGN KEY (id_child) REFERENCES public.series(id),
    PRIMARY KEY (id_parent, id_child)
);

CREATE TABLE public.series_relation_hist (
    change_id integer NOT NULL,
    id_child integer NOT NULL,
    relation_type public.series_rel_type NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    FOREIGN KEY (id_child) REFERENCES public.series(id),
    PRIMARY KEY (change_id, id_child)
);

CREATE TABLE public.series_book (
    series_id integer NOT NULL,
    book_id integer NOT NULL,
    sort_order integer NOT NULL,
    book_type series_book_type NOT NULL,
    FOREIGN KEY (series_id) REFERENCES public.series(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (series_id, book_id)
);

CREATE TABLE public.series_book_hist (
    change_id integer NOT NULL,
    book_id integer NOT NULL,
    sort_order integer NOT NULL,
    book_type series_book_type NOT NULL,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (change_id, book_id)
);

CREATE TABLE public.series_title (
    series_id integer NOT NULL,
    lang public.language NOT NULL,
    official boolean NOT NULL,
    title text NOT NULL,
    romaji text,
    FOREIGN KEY (series_id) REFERENCES public.series(id),
    PRIMARY KEY (series_id, lang)
);

CREATE TABLE public.series_title_hist (
    change_id integer NOT NULL,
    lang public.language NOT NULL,
    official boolean NOT NULL,
    title text NOT NULL,
    romaji text,
    FOREIGN KEY (change_id) REFERENCES public.change(id),
    PRIMARY KEY (change_id, lang)
);

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

CREATE TABLE public.user_list_label (
    id integer NOT NULL,
    private boolean NOT NULL,
    user_id text NOT NULL,
    label text NOT NULL,
    target public.list_label_target NOT NULL DEFAULT 'both',
    sort_order integer NOT NULL DEFAULT 0,
    UNIQUE (user_id, label),
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    PRIMARY KEY(user_id, id)
);

CREATE TABLE public.user_list_book (
    added timestamptz NOT NULL DEFAULT NOW(),
    last_updated timestamptz NOT NULL,
    book_id integer NOT NULL,
    score integer,
    started date,
    finished date,
    user_id text NOT NULL,
    notes text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (book_id) REFERENCES public.book(id),
    PRIMARY KEY (user_id, book_id)
);

CREATE TABLE public.user_list_book_label (
    label_id integer NOT NULL,
    book_id integer NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, label_id) REFERENCES public.user_list_label(user_id, id),
    FOREIGN KEY (user_id, book_id) REFERENCES public.user_list_book(user_id, book_id),
    PRIMARY KEY (label_id, user_id, book_id)
);

CREATE TABLE public.user_list_release (
    added timestamptz NOT NULL DEFAULT NOW(),
    release_id integer NOT NULL,
    release_status public.list_release_status NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (release_id) REFERENCES public.release(id),
    PRIMARY KEY (user_id, release_id)
);

CREATE TABLE public.user_list_series (
    added timestamptz NOT NULL DEFAULT NOW(),
    last_updated timestamptz NOT NULL,
    series_id integer NOT NULL,
    volumes_read integer,
    score integer,
    started date,
    finished date,
    notes text NOT NULL,
    notify_book boolean NOT NULL,
    show_upcoming boolean NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (series_id) REFERENCES public.series(id),
    PRIMARY KEY (user_id, series_id)
);

CREATE TABLE public.user_list_series_label (
    label_id integer NOT NULL,
    series_id integer NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, label_id) REFERENCES public.user_list_label(user_id, id),
    FOREIGN KEY (user_id, series_id) REFERENCES public.user_list_series(user_id, series_id),
    PRIMARY KEY (label_id, user_id, series_id)
);

CREATE TABLE public.user_list_series_lang (
    series_id integer NOT NULL,
    lang public.language NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, series_id) REFERENCES public.user_list_series(user_id, series_id),
    PRIMARY KEY (user_id, series_id, lang)
);

CREATE TABLE public.user_list_series_format (
    series_id integer NOT NULL,
    format public.release_format NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, series_id) REFERENCES public.user_list_series(user_id, series_id),
    PRIMARY KEY (user_id, series_id, format)
);

CREATE TABLE public.user_list_staff (
    staff_id integer NOT NULL,
    added timestamptz NOT NULL DEFAULT NOW(),
    show_upcoming boolean NOT NULL,
    notify_book boolean NOT NULL,
    only_first_book boolean NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (staff_id) REFERENCES public.staff(id),
    PRIMARY KEY (user_id, staff_id)
);

CREATE TABLE public.user_list_staff_lang (
    staff_id integer NOT NULL,
    lang public.language NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, staff_id) REFERENCES public.user_list_staff(user_id, staff_id),
    PRIMARY KEY (user_id, staff_id, lang)
);

CREATE TABLE public.user_list_staff_format (
    staff_id integer NOT NULL,
    format public.release_format NOT NULL,
    user_id text NOT NULL,
    FOREIGN KEY (user_id, staff_id) REFERENCES public.user_list_staff(user_id, staff_id),
    PRIMARY KEY (user_id, staff_id, format)
);

CREATE TABLE public.user_list_publisher (
    publisher_id integer NOT NULL,
    added timestamptz NOT NULL DEFAULT NOW(),
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    FOREIGN KEY (publisher_id) REFERENCES public.publisher(id),
    PRIMARY KEY (user_id, publisher_id)
);

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

CREATE TABLE public.user_list_settings (
    user_id text NOT NULL,
    default_series_settings JSONB NOT NULL DEFAULT '{"formats": [], "langs": ["en"], "notify_book": true, "readingStatus": "Reading", "show_upcoming": true}'::jsonb,
    default_book_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    default_release_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    PRIMARY KEY (user_id)
);

CREATE INDEX book_staff_alias_book_id_idx ON public.book_staff_alias USING btree (book_id);

CREATE INDEX release_book_book_id_idx ON public.release_book USING btree (book_id);

CREATE INDEX release_publisher_publisher_id_idx ON public.release_publisher USING btree (publisher_id);

CREATE INDEX series_book_book_id_idx ON public.series_book USING btree (book_id);

-- TODO This book and series index for user lists is needed because their respective ids are in a composite PK as the last item
CREATE INDEX user_list_book_label_book_id_idx ON public.user_list_book_label USING btree (book_id);

CREATE INDEX user_list_series_label_series_id_idx ON public.user_list_series_label USING btree (series_id);

-- TODO This index is because the PK on staff_alias_hist uses (aid, change_id), which means we don't get the benefit of an index on change_id when joining
CREATE INDEX IF NOT EXISTS staff_alias_hist_change_id_idx ON public.staff_alias_hist USING btree (change_id);

-- trigram indices
CREATE INDEX IF NOT EXISTS book_title_title_trgm_idx ON book_title USING GIST (title gist_trgm_ops);

CREATE INDEX IF NOT EXISTS book_title_romaji_trgm_idx ON book_title USING GIST (romaji gist_trgm_ops);

CREATE INDEX IF NOT EXISTS series_title_title_trgm_idx ON series_title USING GIST (title gist_trgm_ops);

CREATE INDEX IF NOT EXISTS series_title_romaji_trgm_idx ON series_title USING GIST (romaji gist_trgm_ops);

CREATE INDEX IF NOT EXISTS release_title_trgm_idx ON release USING GIST (title gist_trgm_ops);

CREATE INDEX IF NOT EXISTS release_romaji_trgm_idx ON release USING GIST (romaji gist_trgm_ops);