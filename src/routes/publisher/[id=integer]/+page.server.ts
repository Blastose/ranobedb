import { getDisplayPrefsUser, getNameDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { pageSchema, publisherTabsSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;
	const svTab = await superValidate(url, zod(publisherTabsSchema));

	const tab = svTab.data.tab;
	const id = Number(params.id);

	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers.getPublisher(id).executeTakeFirst();

	if (!publisher) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: publisher,
		itemId: id,
		itemName: 'publisher',
		title: getNameDisplay({ obj: publisher, prefs: getDisplayPrefsUser(locals.user).names }),
		user: locals.user,
	});

	const { count, totalPages, works } = await dbPublishers.getWorksPaged({ id, currentPage, tab });
	return { publisher, works, count, currentPage, totalPages };
};
