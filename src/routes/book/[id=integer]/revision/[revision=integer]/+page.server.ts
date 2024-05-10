import { DBBooks } from '$lib/server/db/books/books.js';
import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { detailedDiff } from 'deep-object-diff';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { db } from '$lib/server/db/db.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const bookPromise = dbBooks.getBookHist(bookId, revision).executeTakeFirst();
	const changesPromise = getChanges('book', bookId, [
		previousRevision,
		revision,
		revision + 1,
	]).execute();

	const [book, changes] = await Promise.all([bookPromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!book) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(book);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/book/${bookId}`);
		}
	}
	let diff;
	if (previousRevision > 0) {
		const prevBook = await dbBooks.getBookHist(bookId, previousRevision).executeTakeFirst();
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
		changes: { prevChange, change, nextChange },
	};
};
