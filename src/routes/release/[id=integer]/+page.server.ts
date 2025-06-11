import { getDisplayPrefsUser, getNameDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { userListReleaseSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);
	const dbReleases = DBReleases.fromDB(db, locals.user);
	const release = await dbReleases.getRelease(id).executeTakeFirst();

	if (!release) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: release,
		itemId: id,
		itemName: 'release',
		title: getNameDisplay({
			obj: release,
			prefs: getDisplayPrefsUser(locals.user).names,
		}),
		user: locals.user,
	});

	const userListReleaseForm = await superValidate(zod4(userListReleaseSchema));

	return { release, userListReleaseForm: locals.user ? userListReleaseForm : undefined };
};
