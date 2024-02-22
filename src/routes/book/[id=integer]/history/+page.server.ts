import { getBook } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const bookId = Number(id);

	const changes = await db
		.selectFrom('change')
		.innerJoin('auth_user', 'change.user_id', 'auth_user.id')
		.where('change.item_name', '=', 'book')
		.where('change.item_id', '=', bookId)
		.selectAll('change')
		.select('auth_user.username')
		.orderBy('change.revision desc')
		.execute();

	const book = await getBook(bookId).executeTakeFirstOrThrow();
	if (!book) {
		error(404);
	}

	return { changes, book };
};
