import { editBook } from '$lib/server/db/books/actions.js';
import { getBook, getBookHist } from '$lib/server/db/books/books';
import { bookSchema, revisionSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const id = params.id;
	const bookId = Number(id);
	let book;

	const revision = await superValidate(url, zod(revisionSchema));
	if (revision.valid && url.searchParams.get('revision')) {
		book = await getBookHist(bookId, revision.data.revision).executeTakeFirst();
	} else {
		book = await getBook(bookId).executeTakeFirst();
	}

	if (!book) {
		error(404);
	}

	if (revision.valid && url.searchParams.get('revision')) {
		book = { ...book, comment: `Reverted to revision ${revision.data.revision}` };
	}

	const form = await superValidate(book, zod(bookSchema), { errors: false });

	return { book, form };
};

export const actions = {
	default: async ({ request, locals, params }) => {
		const id = Number(params.id);
		if (!locals.user) redirect(302, '/');
		if (locals.user.role === 'user') return fail(403);

		const form = await superValidate(request, zod(bookSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);

		try {
			await editBook({ book: form.data, id }, locals.user);
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'book_staff_alias' &&
					e.constraint === 'book_staff_alias_pkey'
				) {
					return setError(
						form,
						'staff._errors',
						'Duplicate staff member with same roles in form. Remove duplicates and try again.'
					);
				}
			}
		}

		return message(form, { text: 'Valid form', type: 'success' });
	}
};
