import { db } from '$lib/server/db/db.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);

	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers.getPublisher(id).executeTakeFirst();

	if (!publisher) {
		error(404);
	}

	return { publisher };
};
