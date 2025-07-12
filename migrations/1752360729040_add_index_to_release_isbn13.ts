import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE INDEX IF NOT EXISTS release_isbn13_idx ON public.release USING btree (isbn13);
`.execute(db);
}
