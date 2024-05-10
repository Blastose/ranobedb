import { getChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const publisherId = Number(id);

	const changes = await getChanges('publisher', publisherId).execute();
	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers.getPublisher(publisherId).executeTakeFirstOrThrow();
	if (!publisher) {
		error(404);
	}

	return { changes, publisher };
};
