import { db } from '$lib/server/db/db.js';
import { getSeries } from '$lib/server/db/series/query.js';
import {
	listFiltersSchema,
	pageSchema,
	qSchema,
	seriesFiltersSchema,
} from '$lib/server/zod/schema.js';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getSavedFilters, getDefaultSavedFilter } from '$lib/server/db/user/saved-filters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const userListFilters =
		locals.user && new URLSearchParams(url.search).size === 0
			? await getDefaultSavedFilter(locals.user.id, 'series', false)
			: null;

	if (userListFilters?.filters && new URLSearchParams(url.search).size === 0) {
		const newUrlSearchParams = new URLSearchParams(userListFilters?.filters);
		const newUrl = new URL(url);
		newUrl.search = newUrlSearchParams.toString();
		redirect(307, newUrl);
	}

	const savedFilters = await getSavedFilters(locals.user?.id, 'series', false);

	const urlSearchForm = await superValidate(
		{ filters: url.search, target: 'series', is_list: false },
		zod4(listFiltersSchema),
		{ errors: false },
	);

	const form = await superValidate(url, zod4(seriesFiltersSchema));

	const res = await getSeries({
		currentPage,
		db,
		q,
		url,
		listUser: locals.user,
		currentUser: locals.user,
		form,
		limit: 24,
	});

	return {
		series: res.series,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
		filtersFormObj: res.filtersFormObj,
		genres: res.genres,
		allCustLabels: res.allCustLabels,
		urlSearchForm,
		savedFilters,
	};
};
