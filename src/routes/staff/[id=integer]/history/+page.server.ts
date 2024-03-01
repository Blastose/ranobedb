import { getChanges } from '$lib/server/db/change/change.js';
import { getStaffOne } from '$lib/server/db/staff/staff.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const staffId = Number(id);

	const changes = await getChanges('staff', staffId).execute();

	const staff = await getStaffOne(staffId).executeTakeFirstOrThrow();
	if (!staff) {
		error(404);
	}

	return { changes, staff };
};
