--! Previous: sha1:51fb18b22265978e3ac13090445fb36c208dd1b6
--! Hash: sha1:8450de783f4a90c413bf9b9a183d8387f6af9b97

-- Enter migration here
ALTER TABLE public.publisher ALTER COLUMN name SET NOT NULL;
