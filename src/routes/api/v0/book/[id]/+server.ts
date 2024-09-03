import { DBBooks } from '$lib/server/db/books/books';
import { DBChanges } from '$lib/server/db/change/change.js';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/db.js';
import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	const dbBooks = DBBooks.fromDB(db, user);

	const res = await dbBooks.getBookWithBookSeries(bookId);

	if (!res) {
		error(404);
	}

	const { book, book_series } = res;
	await new DBChanges(db).itemHiddenError({
		item: book,
		itemId: bookId,
		itemName: 'book',
		title: getTitleDisplay({ obj: book, prefs: getDisplayPrefsUser(user).title_prefs }),
		user,
	});

	return json({
		book: {
			...book,
			series: book_series,
		},
	});
};
