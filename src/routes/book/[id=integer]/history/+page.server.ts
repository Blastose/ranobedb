import { DBBooks } from '$lib/server/db/books/books.js';
import { getChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const bookId = Number(id);
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(getChanges('book', bookId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const book = await dbBooks.getBook(bookId).executeTakeFirstOrThrow();
	if (!book) {
		error(404);
	}

	return { changes, book, count, currentPage, totalPages };
};
