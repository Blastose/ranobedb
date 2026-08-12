import { db } from '$lib/server/db/db.js';
import type { SafeUser } from '$lib/server/db/user/user';
import { error } from '@sveltejs/kit';
import type { User } from '$lib/server/lucia/lucia';

export async function profilePrivateError(params: {
	routeUser: SafeUser;
	currentUser: User | null;
}) {
	if (params.routeUser.private && params.routeUser.id !== params.currentUser?.id) {
		const res = await db
			.selectFrom('change')
			.where('change.user_id', '=', params.routeUser.id)
			.select('change.id')
			.limit(1)
			.executeTakeFirst();

		const hasChanges = res !== undefined;

		error(403, {
			profilePrivate: {
				hasChanges,
				user: {
					username: params.routeUser.username,
					id_numeric: params.routeUser.id_numeric,
				},
			},
			message: 'Private profile',
		});
	}
}
