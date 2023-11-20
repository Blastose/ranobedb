import { getBooks2, paginationBuilderExecuteWithCount } from '$lib/server/dbHelpers';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const {
		result: books,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(getBooks2, {
		limit: 24,
		page: currentPage
	});

	return {
		books,
		count,
		currentPage,
		totalPages
	};
};
