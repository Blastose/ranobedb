import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { getPaginationFromUrl } from '$lib/util/getPaginationFromUrl';
import { sql } from 'kysely';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const { limit, page } = getPaginationFromUrl(url);

	const releases = await db
		.selectFrom('release')
		.selectAll()
		.select(sql<string>`count(*) over()`.as('count'))
		.orderBy('name_romaji')
		.limit(limit)
		.offset(limit * (page - 1))
		.execute();

	if (!releases) {
		throw error(500);
	}

	let count = 0;
	if (releases.length > 0) {
		count = Number(releases[0].count);
	}

	return { releases, count: count, totalPages: Math.ceil(count / limit) };
};
