import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff, type StaffWorks } from '$lib/server/db/staff/staff';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	// TODO zod
	const tab = (url.searchParams.get('tab') || 'series') as 'books' | 'series';
	const id = Number(params.id);

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(id).executeTakeFirst();
	if (!staff) {
		error(404);
	}

	let works: StaffWorks;
	let count;
	let totalPages;
	if (tab === 'books') {
		const booksQuery = dbStaff.getBooksBelongingToStaff(id);
		const {
			result: books,
			count: countBooks,
			totalPages: totalPagesBooks,
		} = await paginationBuilderExecuteWithCount(booksQuery, {
			limit: 24,
			page: currentPage,
		});
		count = countBooks;
		totalPages = totalPagesBooks;
		works = {
			type: 'book',
			books,
		};
	} else {
		const seriesQuery = dbStaff.getSeriesBelongingToStaff(id);
		const {
			result: series,
			count: countSeries,
			totalPages: totalPagesSeries,
		} = await paginationBuilderExecuteWithCount(seriesQuery, {
			limit: 24,
			page: currentPage,
		});
		count = countSeries;
		totalPages = totalPagesSeries;
		works = {
			type: 'series',
			series,
		};
	}

	return { staff, works, count, currentPage, totalPages };
};
