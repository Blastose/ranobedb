import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import type { InferResult } from 'kysely';
import { withBookTitleCte } from '../books/books';

export const getReleases = db
	.selectFrom('release')
	.selectAll('release')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('publisher')
				.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
				.whereRef('release_publisher.release_id', '=', 'release.id')
				.select(['publisher.name', 'publisher_type'])
		).as('publishers')
	]);

export type Release = InferResult<typeof getReleases>[number];

export function getRelease(id: number) {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('release')
		.selectAll('release')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('publisher')
					.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
					.whereRef('release_publisher.release_id', '=', 'release.id')
					.select(['publisher.name', 'publisher_type', 'publisher.id'])
			).as('publishers'),
			jsonArrayFrom(
				eb
					.selectFrom('cte_book')
					.innerJoin('release_book', (join) =>
						join
							.onRef('release_book.book_id', '=', 'cte_book.id')
							.onRef('release_book.release_id', '=', 'release.id')
					)
					.select([
						'cte_book.id',
						'cte_book.title',
						'cte_book.title_orig',
						'cte_book.romaji',
						'cte_book.romaji_orig'
					])
			).as('books')
		])
		.where('release.id', '=', id);
}
