--! Previous: sha1:f96533fe711f0ff034dc1747542a846bd13ec5ff
--! Hash: sha1:d2edc183d30612544b54f5c5ec46019963ef6488

-- Enter migration here

ALTER SEQUENCE IF EXISTS book_book_id_seq RENAME TO book_id_seq;
ALTER SEQUENCE IF EXISTS book_series_series_id_seq RENAME TO series_id_seq;
ALTER SEQUENCE IF EXISTS person_person_id_seq RENAME TO person_id_seq;
ALTER SEQUENCE IF EXISTS reader_reader_id_seq RENAME TO auth_user_reader_id_seq;
ALTER SEQUENCE IF EXISTS book_series_series_id_seq RENAME TO series_id_seq;
