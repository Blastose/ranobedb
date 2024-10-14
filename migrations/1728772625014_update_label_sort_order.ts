import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
UPDATE public.user_list_label
SET sort_order = CASE
											WHEN id <= 10 THEN id - 11
											ELSE id
								 END
;
`.execute(db);
}
