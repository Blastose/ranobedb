import { hasAddPerms } from '$lib/db/permissions';
import { buildRedirectUrl } from '$lib/utils/url';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addFromScrapedBookData } from '$lib/server/scraper/add';
import { scrapedBookDataSchema } from '$lib/server/zod/schema';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { bookWalkerScraperUrlSchema } from '$lib/server/scraper/bookwalker/bookwalker-scraper';
import { dbItemActionsLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	if (!hasAddPerms(locals.user)) {
		error(403, { missingPerm: 'add' });
	}

	const urlSchemaForm = await superValidate(zod4(bookWalkerScraperUrlSchema), { errors: false });

	return { urlSchemaForm };
};

export const actions = {
	add_from_data: async (event) => {
		const { locals, url, request, cookies } = event;
		if (!locals.user) {
			return fail(401);
		}

		const form = await superValidate(request, zod4(scrapedBookDataSchema));
		if (!hasAddPerms(locals.user)) {
			return fail(403, { form });
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		if (await isLimited(dbItemActionsLimiter, event)) {
			return message(
				form,
				{ type: 'error', text: 'Too many attempts; Please wait 10 seconds' } as const,
				{ status: 429 },
			);
		}

		let addedItem;
		try {
			addedItem = await addFromScrapedBookData({
				user: locals.user,
				scrapedBookData: form.data,
			});
		} catch (e) {
			console.log(e);
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
				if (
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

			return message(form, { type: 'error', text: 'An unknown error has occurred' } as const, {
				status: 400,
			});
		}

		if (addedItem) {
			flashRedirect(
				303,
				`/${addedItem.type}/${addedItem.id}`,
				{ type: 'success', message: `Successfully added ${addedItem.type}!` },
				cookies,
			);
		}

		return fail(400, { form });
	},
} satisfies Actions;
