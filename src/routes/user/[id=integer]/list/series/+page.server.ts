import { db } from '$lib/server/db/db';
import { getSeries } from '$lib/server/db/series/query.js';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { getUserSeriesListCounts } from '$lib/server/db/user/series-list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import {
	listLabelsSchema,
	pageSchema,
	qSchema,
	seriesFiltersSchema,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;
	const listLabels = await superValidate(url, zod(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : [];

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const form = await superValidate(url, zod(seriesFiltersSchema));
	form.data.list = 'In my list';
	const userLabelCounts = await getUserSeriesListCounts(db, listUser.id).execute();
	const userCustLabelCounts = await getUserSeriesListCounts(db, listUser.id, 11, 99).execute();

	const [res, listCounts] = await Promise.all([
		getSeries({
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
		isMyList: locals.user?.id_numeric === userIdNumeric,
		listUser,
		user_list_series: res.series,
		count: res.count,
		totalPages: res.totalPages,
		currentPage,
		labels,
		userLabelCounts,
		userCustLabelCounts,
		listCounts,
		filtersFormObj: res.filtersFormObj,
		genres: res.genres,
		allCustLabels: res.allCustLabels,
	};
};
