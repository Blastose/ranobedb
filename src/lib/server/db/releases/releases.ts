import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { RanobeDB } from '$lib/server/db/db';
import type { InferResult, Kysely } from 'kysely';
import { withBookTitleCte } from '../books/books';
import type { DB } from '$lib/db/dbTypes';
import type { User } from 'lucia';

export class DBReleases {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	getReleases() {
		return this.ranobeDB.db
			.selectFrom('release')
			.selectAll('release')
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.whereRef('release_publisher.release_id', '=', 'release.id')
						.select(['publisher.name', 'publisher_type']),
				).as('publishers'),
			]);
	}

	getRelease(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte())
			.selectFrom('release')
			.selectAll('release')
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.whereRef('release_publisher.release_id', '=', 'release.id')
						.select(['publisher.name', 'publisher_type', 'publisher.id']),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('release_book', (join) =>
							join
								.onRef('release_book.book_id', '=', 'cte_book.id')
								.onRef('release_book.release_id', '=', 'release.id'),
						)
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
						]),
				).as('books'),
			])
			.where('release.id', '=', id);
	}

	getReleaseHist(options: { id: number; revision: number }) {
		return this.ranobeDB.db
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
				'release_hist.title',
			])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin(
							'release_publisher_hist',
							'release_publisher_hist.publisher_id',
							'publisher.id',
						)
						.whereRef('release_publisher_hist.change_id', '=', 'release_hist.change_id')
						.select(['publisher.name', 'publisher_type', 'publisher.id']),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('release_book_hist', (join) =>
							join
								.onRef('release_book_hist.book_id', '=', 'cte_book.id')
								.onRef('release_book_hist.change_id', '=', 'release_hist.change_id'),
						)
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
						]),
				).as('books'),
			])
			.where('change.item_id', '=', options.id)
			.where('change.item_name', '=', 'release')
			.where('change.revision', '=', options.revision);
	}

	getReleaseEdit(id: number) {
		return this.ranobeDB.db
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
				'release.locked',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.whereRef('release_publisher.release_id', '=', 'release.id')
						.select(['publisher.name', 'publisher_type', 'publisher.id']),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('release_book', (join) =>
							join
								.onRef('release_book.book_id', '=', 'cte_book.id')
								.onRef('release_book.release_id', '=', 'release.id'),
						)
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'release_book.rtype',
						]),
				).as('books'),
			])
			.where('release.id', '=', id);
	}

	getReleaseHistEdit(params: { id: number; revision: number }) {
		return this.ranobeDB.db
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
				'release_hist.title',
			])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin(
							'release_publisher_hist',
							'release_publisher_hist.publisher_id',
							'publisher.id',
						)
						.whereRef('release_publisher_hist.change_id', '=', 'release_hist.change_id')
						.select(['publisher.name', 'publisher_type', 'publisher.id']),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('release_book_hist', (join) =>
							join
								.onRef('release_book_hist.book_id', '=', 'cte_book.id')
								.onRef('release_book_hist.change_id', '=', 'release_hist.change_id'),
						)
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'release_book_hist.rtype',
						]),
				).as('books'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'release')
			.where('change.revision', '=', params.revision);
	}
}

export type Release = InferResult<ReturnType<DBReleases['getRelease']>>[number];
export type ReleaseEdit = InferResult<ReturnType<DBReleases['getReleaseEdit']>>[number];
