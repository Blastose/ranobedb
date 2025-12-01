import { db } from '$lib/server/db/db';
import { getSeries } from '$lib/server/db/series/query.js';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { getUserSeriesListCounts } from '$lib/server/db/user/series-list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { seriesListSchema } from '$lib/server/zod/schema.js';
import {
	listFiltersSchema,
	listLabelsSchema,
	pageSchema,
	qSchema,
	seriesFiltersSchema,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));
	const series_list = await superValidate(url, zod4(seriesListSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const userListFilters = await db
		.selectFrom('saved_filter')
		.select('saved_filter.filters')
		.where('saved_filter.user_id', '=', listUser.id)
		.where('saved_filter.item_name', '=', 'series')
		.where('saved_filter.is_list', '=', true)
		.executeTakeFirst();

	const series_list_filter_user = userListFilters?.filters;
	const listFilters =
		series_list.data.serieslist && series_list_filter_user
			? new URLSearchParams(series_list_filter_user)
			: url;

	const listLabels = await superValidate(listFilters, zod4(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : [];

	const form = await superValidate(listFilters, zod4(seriesFiltersSchema));
	form.data.list = 'In my list';
	const userLabelCounts = await getUserSeriesListCounts(db, listUser.id).execute();
	const userCustLabelCounts = await getUserSeriesListCounts(db, listUser.id, 11, 99).execute();

	const urlSearchForm = await superValidate(
		{ filters: url.search, target: 'series', is_list: true },
		zod4(listFiltersSchema),
	);

	const [res, listCounts] = await Promise.all([
		getSeries({
			currentPage,
			db,
			q,
			url: listFilters,
			listUser: listUser,
			currentUser: locals.user,
			form,
			limit: 24,
			isList: true,
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
		urlSearchForm,
	};
};
