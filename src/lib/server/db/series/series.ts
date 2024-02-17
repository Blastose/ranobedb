import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import type { InferResult } from 'kysely';

export const getSeries = db
	.selectFrom('series')
	.selectAll('series')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('book')
				.innerJoin('series_book', 'series_book.book_id', 'book.id')
				.innerJoin('book_title', 'book_title.book_id', 'book.id')
				.whereRef('series_book.series_id', '=', 'series.id')
				.where('book_title.lang', '=', 'ja')
				.where('book_title.official', '=', true)
				.select(['book_title.title', 'book.id'])
				.orderBy('sort_order desc')
		).as('books'),
		jsonArrayFrom(
			eb
				.selectFrom('series_title')
				.whereRef('series_title.series_id', '=', 'series.id')
				.select(['series_title.title', 'series_title.lang', 'series_title.official'])
		).as('titles')
	]);

export type Series = InferResult<typeof getSeries>[number];
