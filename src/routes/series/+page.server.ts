import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getSeries } from '$lib/server/db/series/series.js';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(getSeries, {
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
