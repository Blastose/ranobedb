import { getBook } from '$lib/server/db/books/books';
import { getUserListBookWithLabels } from '$lib/server/db/user/list.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const bookId = Number(id);
	const session = await locals.auth.validate();
	const user = session?.user;

	if (user) {
		const userListBook = await getUserListBookWithLabels(user.userId, bookId).executeTakeFirst();

		console.log(userListBook);
		console.log(userListBook?.labels);
	}

	const book = await getBook(bookId).executeTakeFirst();
	if (!book) {
		throw error(404);
	}

	return {
		book,
		theme: locals.theme
	};
};
