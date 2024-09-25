import { DBBooks } from '$lib/server/db/books/books';
import { DBChanges } from '$lib/server/db/change/change.js';
import {
	getUserBookLabels,
	getUserBookLabelsForBook,
	getUserListBookWithLabels,
	type UserListBookWithLabels,
} from '$lib/server/db/user/list.js';
import {
	userListBookSchema,
	userListReleaseSchema,
	type UserListFormType,
} from '$lib/server/zod/schema.js';
import { type ReadingStatus } from '$lib/server/db/dbTypes';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	let userListBook: UserListBookWithLabels | undefined = undefined;
	if (user) {
		userListBook = await getUserListBookWithLabels(user.id, bookId).executeTakeFirst();
	}

	const dbBooks = DBBooks.fromDB(db, user);

	const res = await dbBooks.getBookWithBookSeries(bookId, locals.user?.id);

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

	const allCustLabels = user ? await getUserBookLabels(user.id, false) : [];
	const selectedCustLabels = user ? await getUserBookLabelsForBook(user.id, bookId) : [];

	const userListForm = await superValidate(
		{
			...userListBook,
			readingStatus,
			type: formType,
			selectedCustLabels: selectedCustLabels.map((v) => v.id),
		},
		zod(userListBookSchema),
		{ errors: false },
	);

	const userListReleaseForm = await superValidate(zod(userListReleaseSchema));

	return {
		book,
		book_series,
		userListForm,
		userListReleaseForm: locals.user ? userListReleaseForm : undefined,
		allCustLabels,
	};
};
