import { editBook } from '$lib/server/db/books/actions.js';
import { getBook } from '$lib/server/db/books/books';
import { bookSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals }) => {
	if (!locals.user) redirect(302, '/');

	const id = params.id;
	const bookId = Number(id);

	const book = await getBook(bookId).executeTakeFirst();
	if (!book) {
		error(404);
	}

	const form = await superValidate(book, zod(bookSchema));

	return { book, form };
};

export const actions = {
	default: async ({ request, locals, params }) => {
		const id = Number(params.id);
		if (!locals.user) redirect(302, '/');
		if (locals.user.role === 'user') fail(403);

		const form = await superValidate(request, zod(bookSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);

		try {
			await editBook({ book: form.data, id }, locals.user);
		} catch (e) {
			console.log(e);
		}

		return message(form, { text: 'Valid form', type: 'success' });
	}
};
