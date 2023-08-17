--! Previous: sha1:b8451002779bdcd681631aaa7fd94e3eec817086
--! Hash: sha1:e97f23a0372ac2bce3298bbce4bacaaf43467a09

-- Enter migration here
ALTER TABLE public.auth_key DROP COLUMN IF EXISTS primary_key;

ALTER TABLE public.auth_key DROP COLUMN IF EXISTS expires;
