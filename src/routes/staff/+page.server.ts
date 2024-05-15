import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const q = url.searchParams.get('q');
	const dbStaff = DBStaff.fromDB(db, locals.user);

	let query = dbStaff
		.getStaff()
		.where('staff.hidden', '=', false)
		.where('staff.locked', '=', false)
		.orderBy('staff_alias.name');
	if (q) {
		query = query.where('staff_alias.name', 'ilike', `%${q}%`);
	}

	const {
		result: staff,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 40,
		page: currentPage,
	});

	return {
		staff,
		count,
		currentPage,
		totalPages,
	};
};
