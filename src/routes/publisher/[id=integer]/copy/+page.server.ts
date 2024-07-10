import { publisherSchema, revisionSchema } from '$lib/server/zod/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasAddPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';

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
	if (!hasAddPerms(locals.user)) {
		error(403);
	}

	const form = await superValidate({ ...publisher }, zod(publisherSchema), {
		errors: false,
	});

	return { publisher, form };
};
