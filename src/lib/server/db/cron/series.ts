import { db } from '$lib/server/db/db';

export async function updateSeriesStartEndDates() {
	// Run after updateBookReleaseDate()
	console.log('Running update series start and end dates job');
	await db
		.with('rel', (db) =>
			db
				.selectFrom('series')
				.innerJoin('series_book', 'series_book.series_id', 'series.id')
				.innerJoin('book', 'book.id', 'series_book.book_id')
				.where('book.hidden', '=', false)
				.groupBy('series.id')
				.select((eb) => [
					'series.id',
					eb.fn.min<number>('book.c_release_date').as('min_book_date'),
					eb.fn.max<number>('book.c_release_date').as('latest_book_date'),
				])
				.select((eb) =>
					eb
						.case()
						.when('series.publication_status', '=', 'completed')
						.then(eb.fn.max<number>('book.c_release_date'))
						.else(eb.val(99999999))
						.end()
						.as('max_book_date'),
				),
		)
		.updateTable('series')
		.from('rel')
		.set((eb) => ({
			c_start_date: eb.ref('rel.min_book_date'),
			c_end_date: eb.ref('rel.max_book_date'),
			c_latest_release_date: eb.ref('rel.latest_book_date'),
		}))
		.whereRef('series.id', '=', 'rel.id')
		.execute();
}

export async function updateSeriesPopularity() {
	console.log('Running update series popularity job');
	await db
		.with('rel', (db) =>
			db
				.selectFrom('series')
				.innerJoin('user_list_series', 'user_list_series.series_id', 'series.id')
				.groupBy('series.id')
				.select((eb) => ['series.id', eb.fn.count<number>('series.id').as('pop')]),
		)
		.updateTable('series')
		.from('rel')
		.set((eb) => ({
			c_popularity: eb.ref('rel.pop'),
		}))
		.whereRef('series.id', '=', 'rel.id')
		.execute();
}
