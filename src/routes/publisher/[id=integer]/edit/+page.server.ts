import { publisherSchema, revisionSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { DBPublisherActions } from '$lib/server/db/publishers/actions.js';
import { revertedRevisionMarkdown } from '$lib/db/revision.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { dbItemActionsLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	const id = params.id;
	const publisherId = Number(id);
	let publisher;

	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const revision = await superValidate(url, zod(revisionSchema));
	if (revision.valid && revision.data.revision) {
		publisher = await dbPublishers
			.getPublisherHistEdit({
				id: publisherId,
				revision: revision.data.revision,
			})
			.executeTakeFirst();
	} else {
		publisher = await dbPublishers.getPublisherEdit(publisherId).executeTakeFirst();
	}

	if (!publisher) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(publisher);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}
	if (!hasEditPerms(locals.user)) {
		error(403);
	}

	const prefilledComment = revision.data.revision
		? revertedRevisionMarkdown('publisher', publisherId, revision.data.revision)
		: undefined;

	const form = await superValidate(
		{ ...publisher, comment: prefilledComment },
		zod(publisherSchema),
		{
			errors: false,
		},
	);

	return { publisher, form };
};

export const actions = {
	default: async (event) => {
		const { request, locals, params, cookies } = event;
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(publisherSchema));
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

		let success = false;
		const dbPublisherActions = DBPublisherActions.fromDB(db);
		try {
			await dbPublisherActions.editPublisher({ publisher: form.data, id }, locals.user);
			success = true;
		} catch (e) {
			console.log(e);
			if (e instanceof DatabaseError) {
				if (
					(e.code === '23505' &&
						e.table === 'publisher_relation' &&
						e.constraint === 'publisher_relation_pkey') ||
					(e.code === '23505' &&
						e.table === 'publisher_relation_hist' &&
						e.constraint === 'publisher_relation_hist_pkey')
				) {
					return setError(
						form,
						'child_publishers._errors',
						'Duplicate publishers in form. Remove duplicates and try again',
					);
				}
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			}
		}

		if (success) {
			flashRedirect(
				303,
				`/publisher/${id}`,
				{ type: 'success', message: 'Successfully edited publisher!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
