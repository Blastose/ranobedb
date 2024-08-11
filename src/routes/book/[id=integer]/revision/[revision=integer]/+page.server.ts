import { DBBooks } from '$lib/server/db/books/books.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { db } from '$lib/server/db/db.js';
import { type Diff } from '$lib/components/history/utils.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';
import { getBookDiffs } from '$lib/server/db/books/diff.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const bookPromise = dbBooks.getBookHist(bookId, revision).executeTakeFirst();
	const changesPromise = new DBChanges(db)
		.getChanges('book', bookId, [previousRevision, revision, revision + 1])
		.execute();

	const [book, changes, currentBookVisibility, book_series] = await Promise.all([
		bookPromise,
		changesPromise,
		db
			.selectFrom('book')
			.where('book.id', '=', bookId)
			.select(['hidden', 'locked'])
			.executeTakeFirst(),
		dbBooks.getBookSeries(bookId).executeTakeFirst(),
	]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!book || !currentBookVisibility) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(currentBookVisibility);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/book/${bookId}`);
		}
	}
	let diffs: Diff[] = [];
	const displayPrefs = getDisplayPrefsUser(locals.user);
	if (previousRevision > 0) {
		const [prevBookHistEdit, bookHistEdit] = await Promise.all([
			dbBooks
				.getBookHistEdit({
					id: bookId,
					revision: previousRevision,
				})
				.executeTakeFirst(),
			dbBooks.getBookHistEdit({ id: bookId, revision }).executeTakeFirst(),
		]);
		if (!prevBookHistEdit || !bookHistEdit) {
			error(404);
		}
		diffs = getBookDiffs({ prevBookHistEdit, bookHistEdit, displayPrefs });
	}

	return {
		bookId,
		book,
		book_series,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
		currentItemVisibility: currentBookVisibility,
	};
};
