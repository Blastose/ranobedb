import { getChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const staffId = Number(id);

	const changes = await getChanges('staff', staffId).execute();
	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(staffId).executeTakeFirstOrThrow();
	if (!staff) {
		error(404);
	}

	return { changes, staff };
};
