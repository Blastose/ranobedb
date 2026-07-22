import { db } from '$lib/server/db/db.js';
import { getReleases } from '$lib/server/db/releases/query.js';
import { listFiltersSchema } from '$lib/server/zod/schema.js';
import { pageSchema, qSchema, releaseFiltersSchema } from '$lib/server/zod/schema.js';
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
			? await getDefaultSavedFilter(locals.user.id, 'release', false)
			: null;

	if (userListFilters?.filters && new URLSearchParams(url.search).size === 0) {
		const newUrlSearchParams = new URLSearchParams(userListFilters?.filters);
		const newUrl = new URL(url);
		newUrl.search = newUrlSearchParams.toString();
		redirect(307, newUrl);
	}

	const savedFilters = await getSavedFilters(locals.user?.id, 'release', false);

	const urlSearchForm = await superValidate(
		{ filters: url.search, target: 'release', is_list: false },
		zod4(listFiltersSchema),
		{ errors: false },
	);

	const form = await superValidate(url, zod4(releaseFiltersSchema));

	const res = await getReleases({
		currentPage,
		db,
		q,
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
		urlSearchForm,
		savedFilters,
	};
};
