import { DBBooks } from '$lib/server/db/books/books';
import { bookSchema, revisionSchema } from '$lib/server/zod/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { hasAddPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
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
	const revision = await superValidate(url, zod4(revisionSchema));
	if (revision.valid && revision.data.revision) {
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
	if (!hasAddPerms(user)) {
		error(403, { missingPerm: 'add' });
	}

	const form = await superValidate({ ...book }, zod4(bookSchema), {
		errors: false,
	});

	return { book, form };
};
