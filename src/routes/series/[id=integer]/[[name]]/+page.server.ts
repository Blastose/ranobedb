import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const series = await db
		.selectFrom('series')
		.selectAll('series')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('book_info')
					.innerJoin('book_series', 'book_series.book_id', 'book_info.id')
					.selectAll('book_info')
					.whereRef('book_series.series_id', '=', 'series.id')
					.orderBy('book_info.release_date')
			).as('books')
		])
		.where('series.id', '=', id)
		.executeTakeFirst();

	if (!series) {
		throw error(500);
	}

	return { series };
}) satisfies PageServerLoad;
