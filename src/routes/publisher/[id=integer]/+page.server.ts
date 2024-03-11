import { getPublisher } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);

	const publisher = await getPublisher(id).executeTakeFirst();

	if (!publisher) {
		error(404);
	}

	return { publisher };
};
