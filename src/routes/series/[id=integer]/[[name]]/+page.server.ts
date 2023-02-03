import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const seriesPromise = db
		.selectFrom('book_series')
		.selectAll()
		.where('book_series.id', '=', id)
		.executeTakeFirst();

	const booksPromise = db
		.selectFrom('book_series')
		.innerJoin('part_of', 'book_series.id', 'part_of.series_id')
		.innerJoin('book_info', 'book_info.id', 'part_of.book_id')
		.where('series_id', '=', id)
		.selectAll('book_info')
		.orderBy('book_info.release_date')
		.execute();

	const [series, books] = await Promise.all([seriesPromise, booksPromise]);

	if (!books || !series) {
		throw error(500);
	}

	return { series, books };
}) satisfies PageServerLoad;
