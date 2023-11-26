import { getBooks2 } from '$lib/server/db/books/books.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { getUserLabelCounts } from '$lib/server/db/user/list.js';

export const load = async ({ url, params }) => {
	const userId = params.id;
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');

	let k = getBooks2;

	k = k.innerJoin('user_list_book', (join) =>
		join
			.onRef('user_list_book.book_id', '=', 'cte_book.id')
			.on('user_list_book.user_id', '=', userId)
	);

	const userLabelCounts = await getUserLabelCounts(userId).execute();
	console.log(userLabelCounts);

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
		totalPages,
		userLabelCounts
	};
};
