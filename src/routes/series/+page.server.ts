import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const q = url.searchParams.get('q');
	let query = dbSeries.getSeries().where('cte_series.hidden', '=', false);
	if (q) {
		query = query.where('cte_series.title', 'ilike', `%${q}%`);
	}

	query = query.orderBy((eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'));

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
