--! Previous: sha1:df0174c8b8a3b5d8df7d84dc10c880a009b4e861
--! Hash: sha1:14d0a802b9ccab0b4f62382661f5e4784a27e22b

-- Enter migration here

ALTER TABLE IF EXISTS book_series
RENAME TO series;

ALTER TABLE IF EXISTS part_of
RENAME TO book_series;
