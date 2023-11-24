import { getBook } from '$lib/server/db/books/books';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;

	const book = await getBook(Number(id)).executeTakeFirst();

	if (!book) {
		throw error(404);
	}

	return {
		book,
		theme: locals.theme
	};
};
