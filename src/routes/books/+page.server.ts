import { getBooks, paginationBuilderExecuteWithCount } from '$lib/server/dbHelpers';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: books,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(getBooks, {
		limit: 12,
		page: currentPage
	});

	return {
		books,
		count,
		currentPage,
		totalPages
	};
};
