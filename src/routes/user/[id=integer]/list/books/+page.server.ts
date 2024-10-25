import { getBooks } from '$lib/server/db/books/query.js';
import { db } from '$lib/server/db/db';
import { getUserLabelCounts, getUserListCounts } from '$lib/server/db/user/list';
import { DBUsers } from '$lib/server/db/user/user.js';
import {
	listLabelsSchema,
	pageSchema,
	qSchema,
	bookFiltersSchema,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, params, locals }) => {
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}
	const currentPage = page.data.page;
	const q = qS.data.q;
	const listLabels = await superValidate(url, zod(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : [];

	const form = await superValidate(url, zod(bookFiltersSchema));
	form.data.list = 'In my list';

	const userLabelCounts = await getUserLabelCounts(listUser.id).execute();
	const userCustLabelCounts = await getUserLabelCounts(listUser.id, 11, 99).execute();

	const [res, listCounts] = await Promise.all([
		getBooks({
			currentPage,
			db,
			q,
			url,
			listUser: listUser,
			currentUser: locals.user,
			form,
			limit: 24,
		}),
		getUserListCounts({ userId: listUser.id }),
	]);

	return {
		books: res.books,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
		userLabelCounts,
		userCustLabelCounts,
		isMyList: locals.user?.id_numeric === userIdNumeric,
		listUser,
		labels,
		listCounts,
		allCustLabels: res.allCustLabels,
		filtersFormObj: res.filtersFormObj,
	};
};
