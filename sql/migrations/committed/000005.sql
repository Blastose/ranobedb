--! Previous: sha1:14d0a802b9ccab0b4f62382661f5e4784a27e22b
--! Hash: sha1:51fb18b22265978e3ac13090445fb36c208dd1b6

-- Enter migration here
do $$
BEGIN
    IF EXISTS(
        SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'person'
            AND column_name = 'person_id'
    ) THEN
        ALTER TABLE public.person
            RENAME COLUMN person_id to id;
    END IF;
END$$;

do $$
BEGIN
    IF EXISTS(
        SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'person'
            AND column_name = 'person_name'
    ) THEN
        ALTER TABLE public.person
            RENAME COLUMN person_name to name;
    END IF;
END$$;

do $$
BEGIN
    IF EXISTS(
        SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'person'
            AND column_name = 'person_name_romaji'
    ) THEN
        ALTER TABLE public.person
            RENAME COLUMN person_name_romaji to name_romaji;
    END IF;
END$$;

do $$
BEGIN
    IF EXISTS(
        SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'person'
            AND column_name = 'person_description'
    ) THEN
        ALTER TABLE public.person
            RENAME COLUMN person_description to description;
    END IF;
END$$;

do $$
BEGIN
    IF EXISTS(
        SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'person'
            AND column_name = 'person_description_markdown'
    ) THEN
        ALTER TABLE public.person
            RENAME COLUMN person_description_markdown to description_markdown;
    END IF;
END$$;
