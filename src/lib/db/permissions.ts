import type { User } from 'lucia';
import type { UserRole } from '../server/db/dbTypes';

type Perm = 'edit' | 'add' | 'visibility';
export const permissions: Record<UserRole, Perm[]> = {
	admin: ['edit', 'add', 'visibility'],
	moderator: ['edit', 'add', 'visibility'],
	editor: ['edit', 'add'],
	user: [],
	unverified: [],
	banned: [],
};

export function hasVisibilityPerms(user: User | null) {
	if (!user) return false;
	return permissions[user.role].includes('visibility');
}
export function hasEditPerms(user: User | null) {
	if (!user) return false;
	return permissions[user.role].includes('edit');
}
export function hasAddPerms(user: User | null) {
	if (!user) return false;
	return permissions[user.role].includes('add');
}
