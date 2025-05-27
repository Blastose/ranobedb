import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { RanobeDB } from '$lib/server/db/db';
import type { InferResult, Kysely } from 'kysely';
import { withBookTitleCte } from '../books/books';
import type { DB } from '$lib/server/db/dbTypes';
import type { User } from '$lib/server/lucia/lucia';

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
		return this.ranobeDB.db.selectFrom('release').selectAll('release');
	}

	getReleasesWithImage() {
		return this.ranobeDB.db
			.selectFrom('release')
			.selectAll('release')
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('image')
						.selectAll('image')
						.innerJoin('release_book', 'release.id', 'release_book.release_id')
						.innerJoin('book', 'book.id', 'release_book.book_id')
						.whereRef('image.id', '=', 'book.image_id')
						.where('book.hidden', '=', false)
						.limit(1),
				).as('image'),
			]);
	}

	getRelease(id: number) {
		return this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('release')
			.selectAll('release')
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.whereRef('release_publisher.release_id', '=', 'release.id')
						.select(['publisher.name', 'publisher.romaji', 'publisher_type', 'publisher.id'])
						.where('publisher.hidden', '=', false)
						.orderBy('release_publisher.publisher_type')
						.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name')),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('release_book', (join) =>
							join
								.onRef('release_book.book_id', '=', 'cte_book.id')
								.onRef('release_book.release_id', '=', 'release.id'),
						)
						.leftJoin('series_book', 'series_book.book_id', 'release_book.book_id')
						.leftJoin('series', 'series.id', 'series_book.series_id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.lang',
							'series_book.sort_order',
						])
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.selectAll('image')
									.whereRef('image.id', '=', 'cte_book.image_id')
									.limit(1),
							).as('image'),
						)
						.$if(typeof this.ranobeDB.user?.id === 'string', (qb) =>
							qb.select((eb) =>
								jsonObjectFrom(
									eb
										.selectFrom('user_list_book_label')
										.innerJoin('user_list_label', (join) =>
											join
												.onRef('user_list_book_label.label_id', '=', 'user_list_label.id')
												.onRef('user_list_book_label.user_id', '=', 'user_list_label.user_id')
												.onRef('user_list_book_label.book_id', '=', 'cte_book.id'),
										)
										.select('user_list_label.label')
										.where('user_list_label.user_id', '=', String(this.ranobeDB.user?.id))
										.where('user_list_label.id', '<=', 10)
										.limit(1),
								).as('label'),
							),
						)
						.where('cte_book.hidden', '=', false)
						.where((eb) => eb.fn.coalesce('series.hidden', eb.lit(false)), '=', false)
						.orderBy('series_book.sort_order', 'asc'),
				).as('books'),
				jsonObjectFrom(
					eb
						.selectFrom('user_list_release')
						.select(['user_list_release.release_status'])
						.whereRef('user_list_release.release_id', '=', 'release.id')
						.where('user_list_release.user_id', '=', this.ranobeDB.user?.id || ''),
				).as('user_list_release'),
			])
			.where('release.id', '=', id);
	}

	getReleaseHist(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
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
				'release_hist.amazon',
				'release_hist.bookwalker',
				'release_hist.rakuten',
				'release_hist.website',
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
						.select(['publisher.name', 'publisher.romaji', 'publisher_type', 'publisher.id'])
						.whereRef('release_publisher_hist.change_id', '=', 'release_hist.change_id')
						.where('publisher.hidden', '=', false)
						.orderBy('release_publisher_hist.publisher_type')
						.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name')),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('release_book_hist', (join) =>
							join
								.onRef('release_book_hist.book_id', '=', 'cte_book.id')
								.onRef('release_book_hist.change_id', '=', 'release_hist.change_id'),
						)
						.leftJoin('series_book', 'series_book.book_id', 'release_book_hist.book_id')
						.leftJoin('series', 'series.id', 'series_book.series_id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.lang',
							'series_book.sort_order',
						])
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.selectAll('image')
									.whereRef('image.id', '=', 'cte_book.image_id')
									.limit(1),
							).as('image'),
						)
						.where('cte_book.hidden', '=', false)
						.where((eb) => eb.fn.coalesce('series.hidden', eb.lit(false)), '=', false)
						.orderBy('series_book.sort_order', 'asc'),
				).as('books'),
				jsonObjectFrom(
					eb
						.selectFrom('user_list_release')
						.select(['user_list_release.release_status'])
						.where('user_list_release.release_id', '=', params.id)
						.where('user_list_release.user_id', '=', this.ranobeDB.user?.id || ''),
				).as('user_list_release'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'release');
		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision', 'desc');
		}

		return query;
	}

	getReleaseEdit(id: number) {
		return this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
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
				'release.amazon',
				'release.bookwalker',
				'release.rakuten',
				'release.website',
				'release.hidden',
				'release.locked',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.select(['publisher.name', 'publisher.romaji', 'publisher_type', 'publisher.id'])
						.whereRef('release_publisher.release_id', '=', 'release.id')
						.where('publisher.hidden', '=', false)
						.orderBy('release_publisher.publisher_type')
						.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name')),
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
							'cte_book.lang',
							'release_book.rtype',
						])
						.where('cte_book.hidden', '=', false),
				).as('books'),
			])
			.where('release.id', '=', id);
	}

	getReleaseHistEdit(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
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
				'release_hist.amazon',
				'release_hist.bookwalker',
				'release_hist.rakuten',
				'release_hist.website',
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
						.select(['publisher.name', 'publisher.romaji', 'publisher_type', 'publisher.id'])
						.whereRef('release_publisher_hist.change_id', '=', 'release_hist.change_id')
						.where('publisher.hidden', '=', false)
						.orderBy('release_publisher_hist.publisher_type')
						.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name')),
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
							'cte_book.lang',
							'release_book_hist.rtype',
						])
						.where('cte_book.hidden', '=', false),
				).as('books'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'release');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision', 'desc');
		}

		return query;
	}
}

export type Release = InferResult<ReturnType<DBReleases['getRelease']>>[number];
export type ReleaseWithImage = InferResult<ReturnType<DBReleases['getReleasesWithImage']>>[number];
export type ReleaseEdit = InferResult<ReturnType<DBReleases['getReleaseEdit']>>[number];
