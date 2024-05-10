import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(dbSeries.getSeries(), {
		limit: 24,
		page: currentPage,
	});

	return {
		series,
		count,
		currentPage,
		totalPages,
	};
};
