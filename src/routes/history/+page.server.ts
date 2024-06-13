import { getChangesAll, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		getChangesAll({ item_names: [], user: locals.user }),
		{
			limit: historyItemsPerPage,
			page: currentPage,
		},
	);

	return { changes, count, currentPage, totalPages };
};
