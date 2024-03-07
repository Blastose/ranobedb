import { getChanges } from '$lib/server/db/change/change.js';
import { getPublisher } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const publisherId = Number(id);

	const changes = await getChanges('publisher', publisherId).execute();

	const publisher = await getPublisher(publisherId).executeTakeFirstOrThrow();
	if (!publisher) {
		error(404);
	}

	return { changes, publisher };
};
