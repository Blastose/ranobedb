import { db } from '$lib/server/db/db.js';
import { getSeries } from '$lib/server/db/series/query.js';
import { seasonalAnimeSeriesIds, seasonalAnimeSeason } from '$lib/server/db/series/seasonal-anime';
import { seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate({ sort: 'Relevance desc' }, zod4(seriesFiltersSchema));
	const { series } = await getSeries({
		currentPage: 1,
		q: null,
		limit: 100,
		db,
		listUser: locals.user,
		currentUser: locals.user,
		url: new URLSearchParams(),
		form,
		seriesIds: seasonalAnimeSeriesIds,
	});

	return {
		series,
		seasonalAnimeSeason,
	};
};
