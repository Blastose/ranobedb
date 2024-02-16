import { getRelease } from '$lib/server/db/releases/releases.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);

	const release = await getRelease(id).executeTakeFirst();

	if (!release) {
		error(404);
	}

	console.log(release);

	return { release };
};
