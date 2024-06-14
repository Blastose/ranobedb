import { getDisplayPrefsUser, getNameDisplay } from '$lib/display/prefs.js';
import { itemHiddenError } from '$lib/server/db/change/change.js';
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

	await itemHiddenError({
		item: release,
		itemId: id,
		itemName: 'release',
		title: getNameDisplay({
			obj: release,
			prefs: getDisplayPrefsUser(locals.user).names,
		}),
		user: locals.user,
	});

	return { release };
};
