import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPaginationFromUrl } from '$lib/util/getPaginationFromUrl';
import { sql } from 'kysely';
import { error } from '@sveltejs/kit';

export const load = (async ({ url }) => {
	const { limit, page } = getPaginationFromUrl(url);

	const publishers = await db
		.selectFrom('publisher')
		.selectAll()
		.select(sql<string>`count(*) over()`.as('count'))
		.orderBy('id')
		.limit(limit)
		.offset(limit * (page - 1))
		.execute();

	if (!publishers) {
		throw error(500);
	}

	let count = 0;
	if (publishers.length > 0) {
		count = Number(publishers[0].count);
	}

	return { publishers, count: count, totalPages: Math.ceil(count / limit) };
}) satisfies PageServerLoad;
