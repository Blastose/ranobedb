import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, jsonb_agg } from '$lib/server/db';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const series = await db
		.selectFrom('series')
		.selectAll('series')
		.select((qb) =>
			jsonb_agg(
				qb
					.selectFrom('book_info')
					.innerJoin('book_series', 'book_series.book_id', 'book_info.id')
					.selectAll('book_info')
					.whereRef('book_series.series_id', '=', 'series.id')
					.orderBy('book_info.release_date')
			).as('books')
		)
		.where('series.id', '=', id)
		.executeTakeFirst();

	if (!series) {
		throw error(500);
	}

	return { series };
}) satisfies PageServerLoad;
