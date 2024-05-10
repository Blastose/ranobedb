import { DBBooks } from '$lib/server/db/books/books';
import { getChanges } from '$lib/server/db/change/change.js';
import {
	getUserListBookWithLabels,
	type UserListBookWithLabels,
} from '$lib/server/db/user/list.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { userListBookSchema, type ReadingStatus, type UserListFormType } from '$lib/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	let userListBook: UserListBookWithLabels | undefined = undefined;
	if (user) {
		userListBook = await getUserListBookWithLabels(user.id, bookId).executeTakeFirst();
	}

	const dbBooks = DBBooks.fromDB(db, user);
	const book = await dbBooks.getBook(bookId).executeTakeFirstOrThrow();
	if (!book) {
		error(404);
	}

	if (book.hidden) {
		if (!user || (user && !hasVisibilityPerms(user))) {
			const change = await getChanges('book', bookId)
				.orderBy('change.revision desc')
				.executeTakeFirstOrThrow();
			error(403, {
				dbItemDeleted: {
					reason: change.comments,
					title: book.title,
				},
			});
		}
	}

	let formType: UserListFormType;
	if (userListBook) {
		formType = 'update';
	} else {
		formType = 'add';
	}

	let readingStatus: ReadingStatus | undefined = undefined;
	if (userListBook) {
		// ids 1 to 10 are reserved for reading status
		readingStatus = userListBook.labels.filter((v) => v.id <= 10).at(0)?.label as ReadingStatus;
	}
	const userListForm = await superValidate(
		{ ...userListBook, readingStatus, type: formType },
		zod(userListBookSchema),
		{ errors: false },
	);

	return {
		book,
		userListForm,
	};
};
