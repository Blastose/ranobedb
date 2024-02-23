import { getBookHist } from '$lib/server/db/books/books.js';
import { getChanges } from '$lib/server/db/change/change.js';
import { error } from '@sveltejs/kit';
import { detailedDiff } from 'deep-object-diff';

export const load = async ({ params }) => {
	const id = params.id;
	const bookId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const bookPromise = await getBookHist(bookId, revision).executeTakeFirst();

	const changesPromise = await getChanges('book', bookId, [
		previousRevision,
		revision,
		revision + 1
	]).execute();

	const [book, changes] = await Promise.all([bookPromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!book) {
		error(404);
	}

	let diff;
	if (previousRevision > 0) {
		const prevBook = await getBookHist(bookId, previousRevision).executeTakeFirst();
		if (!prevBook) {
			error(404);
		}
		// TODO diff these better
		diff = detailedDiff(prevBook, book);
	}

	return {
		bookId,
		book,
		diff,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange }
	};
};
