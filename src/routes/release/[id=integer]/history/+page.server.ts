import { getChanges } from '$lib/server/db/change/change.js';
import { getRelease } from '$lib/server/db/releases/releases.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const releaseId = Number(id);

	const changes = await getChanges('release', releaseId).execute();

	const release = await getRelease(releaseId).executeTakeFirstOrThrow();
	if (!release) {
		error(404);
	}

	return { changes, release };
};
