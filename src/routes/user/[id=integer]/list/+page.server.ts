import { db } from '$lib/server/db/db';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { DBUsers } from '$lib/server/db/user/user';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const userIdNumeric = Number(params.id);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const isMyList = locals.user?.id_numeric === userIdNumeric;

	if (listUser.private && !isMyList) {
		redirect(303, `/user/${userIdNumeric}`);
	}

	const listCounts = await getUserListCounts({ userId: listUser.id });
	if (Number(listCounts.book) === 0 && Number(listCounts.series) !== 0) {
		redirect(303, `/user/${userIdNumeric}/list/series?serieslist=1`);
	}

	// TODO Let user set default list
	redirect(303, `/user/${userIdNumeric}/list/books?booklist=1`);
};
