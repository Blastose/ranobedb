import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	let k = dbBooks.getBooks();
	k = k.where('cte_book.hidden', '=', false);
	if (query) {
		k = k.where('cte_book.title', 'ilike', `%${query}%`);
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(k, {
		limit: 24,
		page: currentPage,
	});

	return {
		books,
		count,
		currentPage,
		totalPages,
	};
};
