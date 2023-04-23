import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, jsonb_agg } from '$lib/server/db';

export const load = (async ({ params, locals }) => {
	const id = Number(params.id);
	const { session, user } = await locals.auth.validateUser();
	let readingStatusPromise;
	if (session) {
		readingStatusPromise = db
			.selectFrom('reads')
			.leftJoin('book_info', 'book_info.id', 'reads.book_id')
			.leftJoin('reader_labels', (join) =>
				join
					.onRef('reader_labels.reader_id', '=', 'reads.reader_id')
					.onRef('reads.book_id', '=', 'reader_labels.book_id')
			)
			.select(['added_date', 'start_date', 'finish_date', 'label_name'])
			.where('reads.reader_id', '=', user.readerId)
			.where('book_info.id', '=', id)
			.executeTakeFirst();
	}

	const bookPromise = db
		.selectFrom('book_info')
		.selectAll('book_info')
		.select([
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('book_series as p1')
						.innerJoin('book_series as p2', 'p1.series_id', 'p2.series_id')
						.innerJoin('series', 'p1.series_id', 'series.id')
						.innerJoin('book_info as b_sub', 'b_sub.id', 'p1.book_id')
						.select(['p1.series_id', 'series.title as series_title'])
						.select(['b_sub.id', 'b_sub.title', 'b_sub.cover_image_file_name'])
						.distinctOn(['b_sub.id', 'b_sub.release_date'])
						.whereRef('p2.book_id', '=', 'book_info.id')
						.orderBy('b_sub.release_date')
				).as('same_series'),
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('release')
						.innerJoin('book_release', 'book_release.release_id', 'release.id')
						.selectAll('release')
						.whereRef('book_release.book_id', '=', 'book_info.id')
				).as('releases')
		])
		.where('id', '=', id)
		.executeTakeFirst();

	const [book, readingStatus] = await Promise.all([bookPromise, readingStatusPromise]);

	if (!book) {
		throw error(404);
	}

	let readingStatusResult;
	if (!readingStatus) {
		readingStatusResult = {
			added_date: null,
			start_date: null,
			finish_date: null,
			label_name: null
		};
	} else {
		readingStatusResult = readingStatus;
	}

	return { book, readingStatusResult, user };
}) satisfies PageServerLoad;
