import { db } from '$lib/server/db/db';
import { DBUsers } from '$lib/server/db/user/user.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const releases = await db
		.selectFrom('user_list_release')
		.innerJoin('release', 'release.id', 'user_list_release.release_id')
		.selectAll('release')
		.execute();

	return {
		isMyList: user?.id_numeric === userIdNumeric,
		listUser,
		releases,
	};
};
