import { editBook } from '$lib/server/db/books/actions.js';
import { getBook, getBookHist } from '$lib/server/db/books/books';
import { bookSchema, revisionSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const id = params.id;
	const bookId = Number(id);
	let book;

	const revision = await superValidate(url, zod(revisionSchema));
	// We need to check if the url search params contains `revision`
	// because the .valid property will be false if it doesn't,
	// but that's find since we'll just use the "current" revision
	if (revision.valid && url.searchParams.get('revision')) {
		book = await getBookHist(bookId, revision.data.revision).executeTakeFirst();
	} else {
		book = await getBook(bookId).executeTakeFirst();
	}

	if (!book) {
		error(404);
	}
	if (book.hidden || book.locked) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}

	if (revision.valid && url.searchParams.get('revision')) {
		book = { ...book, comment: `Reverted to revision ${revision.data.revision}` };
	}

	const form = await superValidate(book, zod(bookSchema), { errors: false });

	return { book, form };
};

export const actions = {
	default: async ({ request, locals, params, cookies }) => {
		const id = Number(params.id);
		if (!locals.user) redirect(302, '/');

		const form = await superValidate(request, zod(bookSchema));
		if (!permissions[locals.user.role].includes('edit')) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);

		let success = false;
		try {
			await editBook({ book: form.data, id }, locals.user);
			success = true;
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
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			}
		}

		if (success) {
			flashRedirect(
				303,
				`/book/${id}`,
				{ type: 'success', message: 'Successfully edited book!' },
				cookies
			);
		}
		return fail(400, { form });
	}
};
