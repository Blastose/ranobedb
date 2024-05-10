import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const dbStaff = DBStaff.fromDB(db, locals.user);
	const {
		result: staff,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		dbStaff
			.getStaff()
			.where('staff.hidden', '=', false)
			.where('staff.locked', '=', false)
			.orderBy('staff_alias.name'),
		{
			limit: 40,
			page: currentPage,
		},
	);

	return {
		staff,
		count,
		currentPage,
		totalPages,
	};
};
