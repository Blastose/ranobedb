import { DBBooks } from '$lib/server/db/books/books.js';
import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const bookId = Number(id);
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(new DBChanges(db).getChanges('book', bookId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const book = await dbBooks
		.getBook(bookId)
		.clearSelect()
		.select([
			'cte_book.title',
			'cte_book.romaji',
			'cte_book.title_orig',
			'cte_book.romaji_orig',
			'cte_book.lang',
		])
		.executeTakeFirstOrThrow();
	if (!book) {
		error(404);
	}

	return { changes, book, count, currentPage, totalPages };
};
