import { getPublishers } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);

	const publisher = await getPublishers.where('publisher.id', '=', id).executeTakeFirst();

	if (!publisher) {
		error(404);
	}

	return { publisher };
};
