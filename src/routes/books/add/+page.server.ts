import { DBBookActions } from '$lib/server/db/books/actions';
import { bookSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { zod } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
import { hasAddPerms } from '$lib/db/permissions';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
const { DatabaseError } = pkg;

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	if (!hasAddPerms(locals.user)) {
		error(403);
	}

	const form = await superValidate(
		{
			titles: [
				{
					lang: 'ja',
					official: true,
					title: '',
					romaji: '',
				},
			],
			editions: [
				{
					staff: [],
					lang: 'ja',
					title: 'Original edition',
				},
			],
		},
		zod(bookSchema),
		{ errors: false },
	);

	return { form };
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(bookSchema));
		if (!hasAddPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		let newBookId: number | undefined = undefined;
		const dbBookActions = DBBookActions.fromDB(db);

		try {
			newBookId = await dbBookActions.addBook({ book: form.data }, locals.user);
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
			}
		}

		if (newBookId) {
			flashRedirect(
				303,
				`/book/${newBookId}`,
				{ type: 'success', message: 'Successfully added book!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
