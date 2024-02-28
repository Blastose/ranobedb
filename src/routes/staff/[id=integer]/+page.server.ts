import { getStaff } from '$lib/server/db/staff/staff';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);

	const staff = await getStaff.where('staff.id', '=', id).executeTakeFirst();

	if (!staff) {
		error(404);
	}

	return { staff };
};
