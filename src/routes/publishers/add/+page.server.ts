import { publisherSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
import { hasAddPerms } from '$lib/db/permissions';
import { DBPublisherActions } from '$lib/server/db/publishers/actions.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { dbItemActionsLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';
const { DatabaseError } = pkg;

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	if (!hasAddPerms(locals.user)) {
		error(403, { missingPerm: 'add' });
	}

	const form = await superValidate({}, zod4(publisherSchema), { errors: false });

	return { form };
};

export const actions = {
	default: async (event) => {
		const { request, locals, cookies } = event;
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod4(publisherSchema));
		if (!hasAddPerms(locals.user)) {
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

		let newPublisherId: number | undefined = undefined;
		const dbPublisherActions = DBPublisherActions.fromDB(db);
		try {
			newPublisherId = await dbPublisherActions.addPublisher({ publisher: form.data }, locals.user);
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'publisher_relation' &&
					e.constraint === 'publisher_relation_pkey'
				) {
					return setError(
						form,
						'child_publishers._errors',
						'Duplicate publishers in form. Remove duplicates and try again',
					);
				}
			}
		}

		if (newPublisherId) {
			flashRedirect(
				303,
				`/publisher/${newPublisherId}`,
				{ type: 'success', message: 'Successfully added publisher!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
