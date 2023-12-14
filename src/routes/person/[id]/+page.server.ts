import { getPeople } from '$lib/server/db/people/people';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);

	const person = await getPeople.where('person.id', '=', id).executeTakeFirst();

	if (!person) {
		error(404);
	}

	return { person };
};
