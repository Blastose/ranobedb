import { getBookHist } from '$lib/server/db/books/books.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const bookId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const book = await getBookHist(bookId, revision).executeTakeFirst();
	if (!book) {
		error(404);
	}

	if (previousRevision > 0) {
		// const prevBook = await getBookHist(bookId, previousRevision).executeTakeFirst();
		// Diff these somehow
	}

	return { book };
};
