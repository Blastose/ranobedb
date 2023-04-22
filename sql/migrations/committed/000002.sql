--! Previous: sha1:33ea8667e9d29a2271802b77d77280e3497e1fbc
--! Hash: sha1:427eda878a8dbdb5089de73350964680b12bd17d

-- Enter migration here
ALTER TABLE public.book DROP COLUMN IF EXISTS book_label;
ALTER TABLE public.book DROP COLUMN IF EXISTS book_publisher;
