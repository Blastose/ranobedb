import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getStaff } from '$lib/server/db/staff/staff.js';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const {
		result: staff,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(getStaff.orderBy('staff_alias.name'), {
		limit: 40,
		page: currentPage
	});

	return {
		staff,
		count,
		currentPage,
		totalPages
	};
};
