import { getDisplayPrefsUser, getNameDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff, type StaffWorks } from '$lib/server/db/staff/staff';
import { staffTabsSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const svTab = await superValidate(url, zod(staffTabsSchema));
	const tab = svTab.data.tab;
	const id = Number(params.id);

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(id).executeTakeFirst();
	if (!staff) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: staff,
		itemId: id,
		itemName: 'staff',
		title: getNameDisplay({ obj: staff, prefs: getDisplayPrefsUser(locals.user).names }),
		user: locals.user,
	});

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
			type: tab,
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
			type: tab,
			series,
		};
	}

	return { staff, works, count, currentPage, totalPages };
};
