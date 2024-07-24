import type { User } from 'lucia';
import type { UserRole } from '../server/db/dbTypes';

export type Perm = 'edit' | 'add' | 'visibility';
export const permissions: Record<UserRole, Perm[]> = {
	admin: ['edit', 'add', 'visibility'],
	moderator: ['edit', 'add', 'visibility'],
	adder: ['edit', 'add'],
	editor: ['edit'],
	user: [],
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
