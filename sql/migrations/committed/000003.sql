--! Previous: sha1:427eda878a8dbdb5089de73350964680b12bd17d
--! Hash: sha1:df0174c8b8a3b5d8df7d84dc10c880a009b4e861

-- Enter migration here
ALTER TABLE IF EXISTS book_release_rel
RENAME TO book_release;

ALTER TABLE IF EXISTS person_book_rel
RENAME TO person_book;

ALTER TABLE IF EXISTS publisher_release_rel
RENAME TO publisher_release;

ALTER TABLE IF EXISTS publisher_rel
RENAME TO publisher_relation;
