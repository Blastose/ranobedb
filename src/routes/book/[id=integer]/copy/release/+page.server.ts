import { DBBooks } from '$lib/server/db/books/books';
import { languageSchema, releaseSchema, revisionSchema } from '$lib/server/zod/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
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
	const revision = await superValidate(url, zod(revisionSchema));
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
	// Let users with edit perms add new releases
	if (!hasEditPerms(user)) {
		error(403, { missingPerm: 'edit' });
	}

	const lang = await superValidate(url, zod(languageSchema));
	if (!lang.valid) {
		error(400);
	}
	const bookTitle = book.titles.find((v) => v.lang === lang.data.lang) || book.titles.at(0);

	const form = await superValidate(
		{
			lang: lang.data.lang || book.lang,
			romaji: bookTitle?.romaji || undefined,
			title: bookTitle?.title || undefined,
			books: [
				{
					id: bookId,
					rtype: 'complete',
					title: book.title,
					romaji: book.romaji,
					lang: book.lang,
				},
			],
		},
		zod(releaseSchema),
		{
			errors: false,
		},
	);

	return { book, form };
};
