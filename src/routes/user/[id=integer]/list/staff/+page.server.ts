import { db } from '$lib/server/db/db';
import { getStaff } from '$lib/server/db/staff/query';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const qS = await superValidate(url, zod4(qSchema));
	const q = qS.data.q;

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const [res, listCounts] = await Promise.all([
		getStaff({
			currentPage,
			db,
			q,
			url,
			currentUser: locals.user,
			listUser: listUser,
			limit: 40,
		}),
		getUserListCounts({ userId: listUser.id }),
	]);

	return {
		isMyList: locals.user?.id_numeric === userIdNumeric,
		listUser,
		staff: res.staff,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
		listCounts,
	};
};
