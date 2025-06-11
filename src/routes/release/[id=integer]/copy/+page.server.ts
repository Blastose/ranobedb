import { releaseSchema, revisionSchema } from '$lib/server/zod/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { hasAddPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	const id = params.id;
	const releaseId = Number(id);
	let release;
	const dbReleases = DBReleases.fromDB(db, locals.user);
	const revision = await superValidate(url, zod4(revisionSchema));
	if (revision.valid && revision.data.revision) {
		release = await dbReleases
			.getReleaseHistEdit({
				id: releaseId,
				revision: revision.data.revision,
			})
			.executeTakeFirst();
	} else {
		release = await dbReleases.getReleaseEdit(releaseId).executeTakeFirst();
	}

	if (!release) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(release);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}
	if (!hasAddPerms(locals.user)) {
		error(403, { missingPerm: 'add' });
	}

	const form = await superValidate({ ...release }, zod4(releaseSchema), {
		errors: false,
	});

	return { release, form };
};
