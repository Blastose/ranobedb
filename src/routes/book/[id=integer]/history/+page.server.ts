import { DBBooks } from '$lib/server/db/books/books.js';
import { getChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);

	const changes = await getChanges('book', bookId).execute();

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const book = await dbBooks.getBook(bookId).executeTakeFirstOrThrow();
	if (!book) {
		error(404);
	}

	return { changes, book };
};
