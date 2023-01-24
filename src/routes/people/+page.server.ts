import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { getPaginationFromUrl } from '$lib/util/getPaginationFromUrl';
import { sql } from 'kysely';

export const load = (async ({ url }) => {
	const { limit, page } = getPaginationFromUrl(url);

	const people = await db
		.selectFrom('person')
		.selectAll()
		.select(sql<string>`count(*) over()`.as('count'))
		.orderBy('person_name_romaji')
		.limit(limit)
		.offset(limit * (page - 1))
		.execute();

	if (!people) {
		throw error(500);
	}

	let count = 0;
	if (people.length > 0) {
		count = Number(people[0].count);
	}

	return { people, count: count, totalPages: Math.ceil(count / limit) };
}) satisfies PageServerLoad;
