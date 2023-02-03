import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load = (async ({ params, locals }) => {
	const id = Number(params.id);
	const session = await locals.validate();
	let readingStatusPromise;
	if (session) {
		readingStatusPromise = db
			.selectFrom('user')
			.leftJoin('reads', 'user.reader_id', 'reads.reader_id')
			.leftJoin('book_info', 'book_info.id', 'reads.book_id')
			.leftJoin('reader_labels', (join) =>
				join
					.onRef('reader_labels.reader_id', '=', 'reads.reader_id')
					.onRef('reads.book_id', '=', 'reader_labels.book_id')
			)
			.select(['added_date', 'start_date', 'finish_date', 'label_name'])
			.where('user.id', '=', session.userId)
			.where('book_info.id', '=', id)
			.executeTakeFirst();
	}

	const bookPromise = db
		.selectFrom('book_info')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();

	const releasesPromise = db
		.selectFrom('book_release')
		.selectAll()
		.where('book_id', '=', id)
		.execute();

	const sameSeriesPromise = db
		.selectFrom('book_same_series')
		.selectAll()
		.where('orig_book_id', '=', id)
		.execute();

	const [book, releases, sameSeries, readingStatus] = await Promise.all([
		bookPromise,
		releasesPromise,
		sameSeriesPromise,
		readingStatusPromise
	]);

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

	return { book, releases, sameSeries, readingStatusResult };
}) satisfies PageServerLoad;
