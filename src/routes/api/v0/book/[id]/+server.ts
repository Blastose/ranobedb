import { DBBooks } from '$lib/server/db/books/books';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/db.js';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	const dbBooks = DBBooks.fromDB(db, user);

	const res = await dbBooks.getBookWithBookSeries(bookId);

	if (!res || res.book.hidden) {
		error(404);
	}

	const { book, book_series } = res;

	const rep = {
		book: {
			...book,
			series: book_series,
		},
	};

	return json(rep);
};
