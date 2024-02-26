import type { DB, UserRole } from '$lib/db/dbTypes';
import { defaultUserListLabels } from '$lib/zod/schema';
import type { Transaction } from 'kysely';
import type { User } from 'lucia';

export async function insertDefaultUserListLabels(trx: Transaction<DB>, userId: string) {
	const defaultUserListLabelValues = defaultUserListLabels.map((v) => {
		return {
			...v,
			private: false,
			user_id: userId
		};
	});
	await trx
		.insertInto('user_list_label')
		.values(defaultUserListLabelValues)
		.onConflict((oc) => oc.columns(['user_id', 'id']).doNothing())
		.execute();
}

type Perm = 'edit' | 'add' | 'visibility';
export const permissions: Record<UserRole, Perm[]> = {
	admin: ['edit', 'add', 'visibility'],
	moderator: ['edit', 'add', 'visibility'],
	editor: ['edit', 'add'],
	user: [],
	unverified: [],
	banned: []
};

export function hasVisibilityPerms(user: User) {
	return permissions[user.role].includes('visibility');
}
export function hasEditPerms(user: User) {
	return permissions[user.role].includes('edit');
}
