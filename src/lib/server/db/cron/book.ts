import { db } from '$lib/server/db/db';

export async function updateBookReleaseDate() {
	console.log('Running update book release date job');
	await db
		.with('rel', (db) =>
			db
				.selectFrom('book')
				.innerJoin('release_book', 'release_book.book_id', 'book.id')
				.innerJoin('release', 'release.id', 'release_book.release_id')
				.where('release.hidden', '=', false)
				.groupBy('book.id')
				.select((eb) => [
					'book.id',
					eb.fn.min<number>('release.release_date').as('min_release_date'),
					'book.release_date',
				]),
		)
		.updateTable('book')
		.from('rel')
		.set((eb) => ({
			c_release_date: eb.ref('rel.min_release_date'),
		}))
		.whereRef('book.id', '=', 'rel.id')
		.whereRef('book.c_release_date', '=', 'rel.min_release_date')
		.execute();
}
