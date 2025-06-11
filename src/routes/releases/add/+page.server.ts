import { releaseSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
import { hasEditPerms } from '$lib/db/permissions';
import { DBReleaseActions } from '$lib/server/db/releases/actions.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { dbItemActionsLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';
const { DatabaseError } = pkg;

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	// Let users with edit perms add new releases
	if (!hasEditPerms(locals.user)) {
		error(403, { missingPerm: 'edit' });
	}

	const form = await superValidate(
		{ lang: 'ja', format: 'digital', release_date: 99999999 },
		zod4(releaseSchema),
		{
			errors: false,
		},
	);

	return { form };
};

export const actions = {
	default: async (event) => {
		const { request, locals, cookies } = event;
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod4(releaseSchema));
		// Let users with edit perms add new releases
		if (!hasEditPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		if (await isLimited(dbItemActionsLimiter, event)) {
			return message(
				form,
				{ type: 'error', text: 'Too many attempts; Please wait 10 seconds' },
				{ status: 429 },
			);
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
					(e.code === '23505' &&
						e.table === 'release_publisher' &&
						e.constraint === 'release_publisher_pkey') ||
					(e.code === '23505' &&
						e.table === 'release_publisher_hist' &&
						e.constraint === 'release_publisher_hist_pkey')
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
