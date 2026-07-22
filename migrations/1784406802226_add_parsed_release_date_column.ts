import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE OR REPLACE FUNCTION parse_release_date_int(release_date integer)
RETURNS date
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    y integer;
    m integer;
    d integer;
BEGIN
    IF release_date IS NULL OR release_date = 99999999 THEN
        RETURN NULL;
    END IF;

    y := release_date / 10000;
    m := (release_date / 100) % 100;
    d := release_date % 100;

    IF m = 99 THEN
        m := 12;
        d := 31;
    ELSIF d = 99 THEN
        RETURN (make_date(y, m, 1) + interval '1 month' - interval '1 day')::date;
    END IF;

    RETURN make_date(y, m, d);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

ALTER TABLE release
ADD COLUMN release_date_parsed date
GENERATED ALWAYS AS (parse_release_date_int(release_date)) STORED;

ALTER TABLE release_hist
ADD COLUMN release_date_parsed date
GENERATED ALWAYS AS (parse_release_date_int(release_date)) STORED;
`.execute(db);
}
