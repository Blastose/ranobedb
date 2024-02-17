import { getBook } from '$lib/server/db/books/books';
import {
	getUserListBookWithLabels,
	type UserListBookWithLabels
} from '$lib/server/db/user/list.js';
import { userListBookSchema, type ReadingStatus, type UserListFormType } from '$lib/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	let userListBook: UserListBookWithLabels | undefined = undefined;
	if (user) {
		userListBook = await getUserListBookWithLabels(user.id, bookId).executeTakeFirst();
	}

	const book = await getBook(bookId).executeTakeFirst();
	if (!book) {
		error(404);
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
		{ errors: false }
	);

	return {
		book,
		userListForm
	};
};
