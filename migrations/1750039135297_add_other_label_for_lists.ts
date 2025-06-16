import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Fix inconsistent `sort_order`s for user_list_label
	// Before this, some user's `sort_order`s start at -11 and some start at -10
	// This fixes it so they all start at -11 and increase
	// (Custom labels have id > 10)
	await sql`
UPDATE public.user_list_label
SET sort_order = id - 1 - 11
where id <= 10;
`.execute(db);

	// Add `Other` label for all users
	await sql`
INSERT INTO public.user_list_label (id, private, user_id, label, target, sort_order)
SELECT 6 as id, false as private, auth_user.id, 'Other' as label, 'both' as target, -6 as sort_order
FROM auth_user;
`.execute(db);
}
