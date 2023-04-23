--! Previous: sha1:8450de783f4a90c413bf9b9a183d8387f6af9b97
--! Hash: sha1:f96533fe711f0ff034dc1747542a846bd13ec5ff

-- Enter migration here
ALTER TABLE IF EXISTS public.book_release_rel
RENAME TO book_release;

ALTER TABLE IF EXISTS public.person_book_rel
RENAME TO person_book;

ALTER TABLE IF EXISTS public.publisher_release_rel
RENAME TO publisher_release;

ALTER TABLE IF EXISTS public.publisher_rel
RENAME TO publisher_relation;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'series') THEN
        ALTER TABLE public.book_series RENAME TO series;
    END IF;
END $$;

ALTER TABLE IF EXISTS public.part_of
RENAME TO book_series;


ALTER TABLE public.series ALTER COLUMN title SET NOT NULL;
