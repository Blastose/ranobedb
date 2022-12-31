import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async () => {
	const people = await db.selectFrom('person').selectAll().orderBy('person_name_romaji').execute();

	if (!people) {
		throw error(500);
	}

	return { people };
};
