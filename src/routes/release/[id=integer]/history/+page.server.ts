import { getChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const releaseId = Number(id);

	const changes = await getChanges('release', releaseId).execute();
	const dbReleases = DBReleases.fromDB(db, locals.user);
	const release = await dbReleases.getRelease(releaseId).executeTakeFirstOrThrow();
	if (!release) {
		error(404);
	}

	return { changes, release };
};
