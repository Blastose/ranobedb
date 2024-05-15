import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const id = Number(params.id);

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(id).executeTakeFirst();
	const booksQuery = dbStaff.getBooksBelongingToStaff(id);

	if (!staff) {
		error(404);
	}
	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(booksQuery, {
		limit: 24,
		page: currentPage,
	});

	return { staff, books, count, currentPage, totalPages };
};
