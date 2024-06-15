import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';

export const load = async ({ params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const routeUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);

	let isCurrentUser = false;
	if (user?.id_numeric === routeUser.id_numeric) {
		isCurrentUser = true;
	}

	return {
		routeUser,
		isCurrentUser,
	};
};
