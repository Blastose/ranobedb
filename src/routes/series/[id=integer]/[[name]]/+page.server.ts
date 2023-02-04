import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, jsonb_agg } from '$lib/server/db';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const series = await db
		.selectFrom('book_series')
		.selectAll('book_series')
		.select((qb) =>
			jsonb_agg(
				qb
					.selectFrom('book_info')
					.innerJoin('part_of', 'part_of.book_id', 'book_info.id')
					.selectAll('book_info')
					.whereRef('part_of.series_id', '=', 'book_series.id')
					.orderBy('book_info.release_date')
			).as('books')
		)
		.where('book_series.id', '=', id)
		.executeTakeFirst();

	if (!series) {
		throw error(500);
	}

	return { series };
}) satisfies PageServerLoad;
