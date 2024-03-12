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

export const getReleaseHist = (options: { id: number; revision: number }) => {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('release_hist')
		.innerJoin('change', 'change.id', 'release_hist.change_id')
		.select([
			'release_hist.change_id as id',
			'release_hist.description',
			'release_hist.format',
			'release_hist.isbn13',
			'release_hist.lang',
			'release_hist.pages',
			'release_hist.release_date',
			'release_hist.romaji',
			'release_hist.title'
		])
		.select(['change.ihid as hidden', 'change.ilock as locked'])
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('publisher')
					.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
					.where('release_publisher.release_id', '=', options.id)
					.select(['publisher.name', 'publisher_type', 'publisher.id'])
			).as('publishers'),
			jsonArrayFrom(
				eb
					.selectFrom('cte_book')
					.innerJoin('release_book', (join) =>
						join
							.onRef('release_book.book_id', '=', 'cte_book.id')
							.on('release_book.release_id', '=', options.id)
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
		.where('change.item_id', '=', options.id)
		.where('change.item_name', '=', 'release')
		.where('change.revision', '=', options.revision);
};

export function getReleaseEdit(id: number) {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('release')
		.select([
			'release.id',
			'release.description',
			'release.format',
			'release.isbn13',
			'release.lang',
			'release.pages',
			'release.release_date',
			'release.romaji',
			'release.title',
			'release.hidden',
			'release.locked'
		])
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
						'cte_book.romaji_orig',
						'release_book.rtype'
					])
			).as('books')
		])
		.where('release.id', '=', id);
}

export function getReleaseHistEdit(params: { id: number; revision: number }) {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('release_hist')
		.innerJoin('change', 'change.id', 'release_hist.change_id')
		.select([
			'release_hist.change_id as id',
			'release_hist.description',
			'release_hist.format',
			'release_hist.isbn13',
			'release_hist.lang',
			'release_hist.pages',
			'release_hist.release_date',
			'release_hist.romaji',
			'release_hist.title'
		])
		.select(['change.ihid as hidden', 'change.ilock as locked'])
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('publisher')
					.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
					.where('release_publisher.release_id', '=', params.id)
					.select(['publisher.name', 'publisher_type', 'publisher.id'])
			).as('publishers'),
			jsonArrayFrom(
				eb
					.selectFrom('cte_book')
					.innerJoin('release_book', (join) =>
						join
							.onRef('release_book.book_id', '=', 'cte_book.id')
							.on('release_book.release_id', '=', params.id)
					)
					.select([
						'cte_book.id',
						'cte_book.title',
						'cte_book.title_orig',
						'cte_book.romaji',
						'cte_book.romaji_orig',
						'release_book.rtype'
					])
			).as('books')
		])
		.where('change.item_id', '=', params.id)
		.where('change.item_name', '=', 'release')
		.where('change.revision', '=', params.revision);
}

export type Release = InferResult<ReturnType<typeof getRelease>>[number];
export type ReleaseEdit = InferResult<ReturnType<typeof getReleaseEdit>>[number];
