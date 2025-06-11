import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const seriesId = Number(id);
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(new DBChanges(db).getChanges('series', seriesId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});

	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries
		.getSeriesOne(seriesId)
		.clearSelect()
		.select([
			'cte_series.title',
			'cte_series.romaji',
			'cte_series.title_orig',
			'cte_series.romaji_orig',
			'cte_series.lang',
		])
		.executeTakeFirstOrThrow();
	if (!series) {
		error(404);
	}

	return { changes, series, count, currentPage, totalPages };
};
