import { db } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';
import type { Transaction } from 'kysely';
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

export async function updateBookImageCache(trx: Transaction<DB>, bookIds: number[] | 'all') {
	const uniqueBookIds = bookIds === 'all' ? [] : [...new Set(bookIds)];

	if (bookIds !== 'all' && uniqueBookIds.length === 0) {
		return;
	}

	let query = trx.updateTable('book').set((eb) => ({
		c_image_id: eb
			.selectFrom('release_book')
			.innerJoin('release', 'release.id', 'release_book.release_id')
			.select('release.image_id')
			.whereRef('release_book.book_id', '=', 'book.id')
			.where('release.hidden', '=', false)
			.where('release.image_id', 'is not', null)
			.orderBy((eb) =>
				eb
					.case('release_book.rtype')
					.when('complete')
					.then(0)
					.when('omnibus')
					.then(1)
					.when('partial')
					.then(2)
					.else(3)
					.end(),
			)
			.orderBy((eb) =>
				eb.case().when('release.lang', '=', eb.ref('book.olang')).then(0).else(1).end(),
			)
			.orderBy((eb) => eb.case().when('release.release_date', '=', 99999999).then(1).else(0).end())
			.orderBy('release.release_date')
			.orderBy((eb) =>
				eb
					.case('release.format')
					.when('print')
					.then(0)
					.when('digital')
					.then(1)
					.when('audio')
					.then(2)
					.else(3)
					.end(),
			)
			.orderBy('release.id')
			.limit(1),
	}));

	if (bookIds !== 'all') {
		query = query.where('book.id', 'in', uniqueBookIds);
	}

	await query.execute();
}

export async function updateBookImageCacheAll() {
	await db.transaction().execute(async (trx) => {
		await updateBookImageCache(trx, 'all');
	});
}
