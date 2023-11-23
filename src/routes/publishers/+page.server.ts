import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getPublishers } from '$lib/server/db/publishers/publishers.js';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const {
		result: publishers,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(
		getPublishers.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name')),
		{
			limit: 40,
			page: currentPage
		}
	);

	return {
		publishers,
		count,
		currentPage,
		totalPages
	};
};
