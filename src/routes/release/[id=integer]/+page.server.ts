import { db } from '$lib/server/db/db.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);
	const dbReleases = DBReleases.fromDB(db, locals.user);
	const release = await dbReleases.getRelease(id).executeTakeFirst();

	if (!release) {
		error(404);
	}

	return { release };
};
