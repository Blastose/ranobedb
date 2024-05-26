import { releaseSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { zod } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
import { hasAddPerms } from '$lib/db/permissions';
import { DBReleaseActions } from '$lib/server/db/releases/actions.js';
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
		{ lang: 'ja', format: 'digital', release_date: 99999999 },
		zod(releaseSchema),
		{
			errors: false,
		},
	);

	return { form };
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(releaseSchema));
		if (!hasAddPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		let newReleaseId: number | undefined = undefined;
		const dbReleaseActions = DBReleaseActions.fromDB(db);
		try {
			newReleaseId = await dbReleaseActions.addRelease({ release: form.data }, locals.user);
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'release_book' &&
					e.constraint === 'release_book_pkey'
				) {
					return setError(
						form,
						'books._errors',
						'Duplicate books in form. Remove duplicates and try again',
					);
				} else if (
					e.code === '23505' &&
					e.table === 'release_publisher' &&
					e.constraint === 'release_publisher_pkey'
				) {
					return setError(
						form,
						'publishers._errors',
						'Duplicate publishers in form. Remove duplicates and try again',
					);
				}
			}
		}

		if (newReleaseId) {
			flashRedirect(
				303,
				`/release/${newReleaseId}`,
				{ type: 'success', message: 'Successfully added release!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
