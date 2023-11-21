import { getBooks2 } from '$lib/server/db/books/books.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');

	let k = getBooks2;
	if (query) {
		k = k.where('cte_book.title', 'ilike', `%${query}%`);
	}

	const {
		result: books,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(k, {
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
