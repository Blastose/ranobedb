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
				.select((eb) => ['series.id', eb.fn.min<number>('book.c_release_date').as('min_book_date')])
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
		}))
		.whereRef('series.id', '=', 'rel.id')
		.execute();
}
