import { DBBookActions } from '$lib/server/db/books/actions.js';
import { DBBooks } from '$lib/server/db/books/books';
import { bookSchema, revisionSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { revertedRevisionMarkdown } from '$lib/db/revision.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	const id = params.id;
	const bookId = Number(id);
	let book;

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const revision = await superValidate(url, zod(revisionSchema));
	if (revision.data.revision) {
		book = await dbBooks
			.getBookHistEdit({ id: bookId, revision: revision.data.revision })
			.executeTakeFirst();
	} else {
		book = await dbBooks.getBookEdit(bookId).executeTakeFirst();
	}

	if (!book) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(book);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(user)) {
			error(403);
		}
	}
	if (!hasEditPerms(user)) {
		error(403);
	}

	const prefilledComment = revision.data.revision
		? revertedRevisionMarkdown('book', bookId, revision.data.revision)
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

		const dbBookActions = DBBookActions.fromDB(db);
		let success = false;
		try {
			await dbBookActions.editBook({ book: form.data, id }, locals.user);
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
						'editions._errors',
						'Duplicate staff member with same roles in form. Remove duplicates and try again.',
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
				cookies,
			);
		}
		return fail(400, { form });
	},
};
