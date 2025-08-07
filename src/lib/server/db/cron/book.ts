import { db } from '$lib/server/db/db';
import type { Language } from '../dbTypes';

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
		.execute();
}

export async function updateBookReleaseDates() {
	await db
		.with('a', (db) =>
			db
				.selectFrom('book')
				.innerJoin('release_book', 'release_book.book_id', 'book.id')
				.innerJoin('release', 'release.id', 'release_book.release_id')
				.where('release.hidden', '=', false)
				.groupBy(['book.id', 'release.lang'])
				.select((eb) => [
					'book.id',
					eb.fn.min<number>('release.release_date').as('min_release_date'),
					'release.lang',
				]),
		)
		.with('b', (db) =>
			db
				.selectFrom('a')
				.select('a.id')
				.select((eb) =>
					eb
						.fn<{ [K in Language]?: number }>('jsonb_object_agg', ['a.lang', 'a.min_release_date'])
						.as('release_dates'),
				)
				.groupBy('a.id'),
		)
		.updateTable('book')
		.from('b')
		.set((eb) => ({
			c_release_dates: eb.ref('b.release_dates'),
		}))
		.whereRef('book.id', '=', 'b.id')
		.execute();
}
