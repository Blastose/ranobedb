import { db } from '$lib/server/db/db';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const dbStaff = DBStaff.fromDB(db);

	const followedStaff = await dbStaff
		.getStaff()
		.innerJoin('user_list_staff', 'user_list_staff.staff_id', 'staff.id')
		.where('user_list_staff.user_id', '=', listUser.id)
		.execute();

	return {
		isMyList: locals.user?.id_numeric === userIdNumeric,
		listUser,
		followedStaff,
	};
};
