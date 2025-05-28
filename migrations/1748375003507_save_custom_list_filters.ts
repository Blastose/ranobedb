import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.saved_filter (
    user_id text NOT NULL,
    item_name db_item NOT NULL,
		filters text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.auth_user(id),
    PRIMARY KEY (user_id, item_name)
);
`.execute(db);
}
