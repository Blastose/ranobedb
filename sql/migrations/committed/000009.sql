--! Previous: sha1:d2edc183d30612544b54f5c5ec46019963ef6488
--! Hash: sha1:b8451002779bdcd681631aaa7fd94e3eec817086

-- Enter migration here

ALTER TYPE public.book_format ADD VALUE IF NOT EXISTS 'audio';
