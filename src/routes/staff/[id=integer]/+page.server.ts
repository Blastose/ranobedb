import { db } from '$lib/server/db/db.js';
import { DBStaff } from '$lib/server/db/staff/staff';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(id).executeTakeFirst();

	if (!staff) {
		error(404);
	}

	return { staff };
};
