import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const q = url.searchParams.get('q');
	let query = dbSeries.getSeries();
	if (q) {
		query = query.where('cte_series.title', 'ilike', `%${q}%`);
	}
	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
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
