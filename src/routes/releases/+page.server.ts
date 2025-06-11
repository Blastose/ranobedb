import { db } from '$lib/server/db/db.js';
import { getReleases } from '$lib/server/db/releases/query.js';
import { pageSchema, qSchema, releaseFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const form = await superValidate(url, zod4(releaseFiltersSchema));

	const res = await getReleases({
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
		releases: res.releases,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
		filtersFormObj: res.filtersFormObj,
	};
};
