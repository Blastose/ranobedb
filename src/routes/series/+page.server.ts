import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPaginationFromUrl } from '$lib/util/getPaginationFromUrl';
import { sql } from 'kysely';
import { error } from '@sveltejs/kit';

export const load = (async ({ url }) => {
	const { limit, page } = getPaginationFromUrl(url);

	const series = await db
		.selectFrom('book_series')
		.selectAll()
		.select(sql<string>`count(*) over()`.as('count'))
		.orderBy('title_romaji')
		.limit(limit)
		.offset(limit * (page - 1))
		.execute();

	if (!series) {
		throw error(500);
	}

	let count = 0;
	if (series.length > 0) {
		count = Number(series[0].count);
	}

	return { series, count: count, totalPages: Math.ceil(count / limit) };
}) satisfies PageServerLoad;
