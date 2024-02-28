import { getBook } from '$lib/server/db/books/books.js';
import { getChanges } from '$lib/server/db/change/change.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const bookId = Number(id);

	const changes = await getChanges('book', bookId).execute();

	const book = await getBook(bookId).executeTakeFirstOrThrow();
	if (!book) {
		error(404);
	}

	return { changes, book };
};
