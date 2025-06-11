import { db } from '$lib/server/db/db.js';
import { getSeries } from '$lib/server/db/series/query.js';
import { pageSchema, qSchema, seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

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
	};
};
