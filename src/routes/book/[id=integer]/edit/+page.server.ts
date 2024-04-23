import { editBook } from '$lib/server/db/books/actions.js';
import { getBook, getBookHist } from '$lib/server/db/books/books';
import { bookSchema, revisionSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { revertedRevisionMarkdown } from '$lib/db/revision.js';

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

	const visibilityStatus = getCurrentVisibilityStatus(book);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}
	if (!hasEditPerms(locals.user)) {
		error(403);
	}

	const prefilledComment =
		revision.valid && url.searchParams.get('revision')
			? revertedRevisionMarkdown('b', 'book', bookId, revision.data.revision)
			: undefined;

	const form = await superValidate({ ...book, comment: prefilledComment }, zod(bookSchema), {
		errors: false,
	});

	return { book, form };
};

export const actions = {
	default: async ({ request, locals, params, cookies }) => {
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(bookSchema));
		if (!hasEditPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

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
						'Duplicate staff member with same roles in form. Remove duplicates and try again.',
					);
				}
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			} else if (e instanceof HasRelationsError) {
				return setError(
					form,
					'hidden',
					'Cannot hide book. Remove any relations to the book and try again.',
				);
			}
		}

		if (success) {
			flashRedirect(
				303,
				`/book/${id}`,
				{ type: 'success', message: 'Successfully edited book!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
