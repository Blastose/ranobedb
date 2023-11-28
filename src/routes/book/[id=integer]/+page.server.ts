import { getBook } from '$lib/server/db/books/books';
import {
	getUserListBookWithLabels,
	type UserListBookWithLabels
} from '$lib/server/db/user/list.js';
import { userListBookSchema, type UserListFormType } from '$lib/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const session = await locals.auth.validate();
	const user = session?.user;

	let userListBook: UserListBookWithLabels | undefined = undefined;
	if (user) {
		userListBook = await getUserListBookWithLabels(user.userId, bookId).executeTakeFirst();
	}

	const book = await getBook(bookId).executeTakeFirst();
	if (!book) {
		throw error(404);
	}

	let formType: UserListFormType;
	if (userListBook) {
		formType = 'update';
	} else {
		formType = 'add';
	}
	console.log(formType);
	const form = await superValidate({ ...userListBook, type: formType }, userListBookSchema);

	return {
		book,
		userListBook,
		form,
		theme: locals.theme
	};
};
