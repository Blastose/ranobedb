import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const seriesId = Number(id);
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(new DBChanges(db).getChanges('series', seriesId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});

	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries.getSeriesOne(seriesId).executeTakeFirstOrThrow();
	if (!series) {
		error(404);
	}

	return { changes, series, count, currentPage, totalPages };
};
