import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { RanobeDB } from '$lib/server/db/db';
import type { InferResult, Kysely } from 'kysely';
import { DBBooks, withBookTitleCte } from '../books/books';
import type { DB, ReleasePublisherType } from '$lib/server/db/dbTypes';
import type { User } from 'lucia';
import { DBSeries } from '../series/series';
import type { publisherTabs } from '$lib/db/dbConsts';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';

export class DBPublishers {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	getPublishers() {
		return this.ranobeDB.db.selectFrom('publisher').selectAll('publisher');
	}

	getPublisher(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('publisher')
			.selectAll('publisher')
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('release')
						.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
						.select([
							'release.title',
							'release_publisher.publisher_type',
							'release.id',
							'release.release_date',
						])
						.whereRef('release_publisher.publisher_id', '=', 'publisher.id')
						.where('release.hidden', '=', false)
						.orderBy('release.release_date desc')
						.orderBy('release.title')
						.limit(100),
				).as('releases'),
				jsonArrayFrom(
					eb
						.selectFrom('publisher_relation')
						.innerJoin(
							'publisher as child_publisher',
							'child_publisher.id',
							'publisher_relation.id_child',
						)
						.select([
							'child_publisher.name',
							'child_publisher.romaji',
							'child_publisher.id',
							'publisher_relation.relation_type',
						])
						.where('publisher_relation.id_parent', '=', id)
						.where('child_publisher.hidden', '=', false)
						.orderBy('publisher_relation.relation_type')
						.orderBy((eb) => eb.fn.coalesce('child_publisher.romaji', 'child_publisher.name')),
				).as('child_publishers'),
			])
			.where('publisher.id', '=', id);
	}

	getPublisherHist(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('publisher_hist')
			.innerJoin('change', 'change.id', 'publisher_hist.change_id')
			.select([
				'publisher_hist.change_id as id',
				'publisher_hist.description',
				'publisher_hist.name',
				'publisher_hist.romaji',
				'publisher_hist.bookwalker',
				'publisher_hist.twitter_id',
				'publisher_hist.website',
				'publisher_hist.wikidata_id',
			])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('release')
						.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
						.select([
							'release.title',
							'release_publisher.publisher_type',
							'release.id',
							'release.release_date',
						])
						.where('release_publisher.publisher_id', '=', params.id)
						.where('release.hidden', '=', false)
						.orderBy('release.release_date desc')
						.orderBy('release.title')
						.limit(100),
				).as('releases'),
				jsonArrayFrom(
					eb
						.selectFrom('publisher_relation_hist')
						.innerJoin(
							'publisher as child_publisher',
							'child_publisher.id',
							'publisher_relation_hist.id_child',
						)
						.select([
							'child_publisher.name',
							'child_publisher.romaji',
							'child_publisher.id',
							'publisher_relation_hist.relation_type',
						])
						.whereRef('publisher_relation_hist.change_id', '=', 'change.id')
						.where('child_publisher.hidden', '=', false)
						.orderBy('publisher_relation_hist.relation_type')
						.orderBy((eb) => eb.fn.coalesce('child_publisher.romaji', 'child_publisher.name')),
				).as('child_publishers'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'publisher');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision desc');
		}

		return query;
	}

	getPublisherEdit(id: number) {
		return this.ranobeDB.db
			.selectFrom('publisher')
			.select([
				'publisher.id',
				'publisher.description',
				'publisher.name',
				'publisher.romaji',
				'publisher.locked',
				'publisher.hidden',
				'publisher.bookwalker',
				'publisher.twitter_id',
				'publisher.website',
				'publisher.wikidata_id',
			])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('publisher_relation')
						.innerJoin(
							'publisher as child_publisher',
							'child_publisher.id',
							'publisher_relation.id_child',
						)
						.select(['child_publisher.name', 'child_publisher.romaji', 'child_publisher.id'])
						.select('publisher_relation.relation_type')
						.whereRef('publisher_relation.id_parent', '=', 'publisher.id')
						.where('child_publisher.hidden', '=', false)
						.orderBy('publisher_relation.relation_type')
						.orderBy((eb) => eb.fn.coalesce('child_publisher.romaji', 'child_publisher.name')),
				).as('child_publishers'),
			)
			.where('publisher.id', '=', id);
	}

	getPublisherHistEdit(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.selectFrom('publisher_hist')
			.innerJoin('change', 'change.id', 'publisher_hist.change_id')
			.select([
				'publisher_hist.change_id as id',
				'publisher_hist.description',
				'publisher_hist.name',
				'publisher_hist.romaji',
				'publisher_hist.bookwalker',
				'publisher_hist.twitter_id',
				'publisher_hist.website',
				'publisher_hist.wikidata_id',
			])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('publisher_relation_hist')
						.innerJoin(
							'publisher as child_publisher',
							'child_publisher.id',
							'publisher_relation_hist.id_child',
						)
						.select(['child_publisher.name', 'child_publisher.romaji', 'child_publisher.id'])
						.select('publisher_relation_hist.relation_type')
						.whereRef('publisher_relation_hist.change_id', '=', 'publisher_hist.change_id')
						.where('child_publisher.hidden', '=', false)
						.orderBy('publisher_relation_hist.relation_type')
						.orderBy((eb) => eb.fn.coalesce('child_publisher.romaji', 'child_publisher.name')),
				).as('child_publishers'),
			)
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'publisher');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision desc');
		}

		return query;
	}

	getBooksBelongingToPublisher(publisherId: number) {
		return DBBooks.fromDB(this.ranobeDB.db, this.ranobeDB.user)
			.getBooks()
			.innerJoin('release_book', 'release_book.book_id', 'cte_book.id')
			.innerJoin('release_publisher', 'release_book.release_id', 'release_publisher.release_id')
			.innerJoin('release', 'release.id', 'release_book.release_id')
			.where('cte_book.hidden', '=', false)
			.where('release.hidden', '=', false)
			.where('release_publisher.publisher_id', '=', publisherId)
			.clearSelect()
			.select([
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
			])
			.select(({ fn, cast }) => [
				fn
					.agg<ReleasePublisherType[]>('array_agg', [
						cast('release_publisher.publisher_type', 'text'),
					])
					.distinct()
					.as('publisher_type'),
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
			.groupBy([
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
			])
			.clearOrderBy();
	}

	getBooksBelongingToPublisherCount(publisherId: number) {
		return this.ranobeDB.db
			.selectFrom('book')
			.innerJoin('release_book', 'release_book.book_id', 'book.id')
			.innerJoin('release_publisher', 'release_book.release_id', 'release_publisher.release_id')
			.innerJoin('release', 'release.id', 'release_book.release_id')
			.where('book.hidden', '=', false)
			.where('release.hidden', '=', false)
			.where('release_publisher.publisher_id', '=', publisherId)
			.groupBy('book.id');
	}

	getSeriesBelongingToPublisher(publisherId: number) {
		return DBSeries.fromDB(this.ranobeDB.db, this.ranobeDB.user)
			.getSeries()
			.innerJoin('series_book', 'series_book.series_id', 'cte_series.id')
			.innerJoin('release_book', 'release_book.book_id', 'series_book.book_id')
			.innerJoin('release_publisher', 'release_publisher.release_id', 'release_book.release_id')
			.innerJoin('release', 'release.id', 'release_book.release_id')
			.where('release_publisher.publisher_id', '=', publisherId)
			.where('cte_series.hidden', '=', false)
			.where('release.hidden', '=', false)
			.clearSelect()
			.select([
				'cte_series.title',
				'cte_series.bookwalker_id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.id',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title_orig',
				'cte_series.title',
			])
			.select(({ fn, cast }) => [
				fn
					.agg<ReleasePublisherType[]>('array_agg', [
						cast('release_publisher.publisher_type', 'text'),
					])
					.distinct()
					.as('publisher_types'),
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('book')
						.innerJoin('series_book as sb2', 'sb2.series_id', 'cte_series.id')
						.select('book.id')
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
						.whereRef('sb2.book_id', '=', 'book.id')
						.where('book.hidden', '=', false)
						.orderBy('sb2.sort_order asc')
						.limit(1),
				).as('book'),
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('series_book as sb3')
						.innerJoin('book', 'book.id', 'sb3.book_id')
						.where('book.hidden', '=', false)
						.whereRef('sb3.series_id', '=', 'cte_series.id')
						.select(({ fn }) => [fn.countAll().as('count')]),
				).as('volumes'),
			])
			.groupBy([
				'cte_series.title',
				'cte_series.bookwalker_id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.id',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title_orig',
				'cte_series.title',
			]);
	}

	getSeriesBelongingToPublisherCount(publisherId: number) {
		return this.ranobeDB.db
			.selectFrom('series')
			.innerJoin('series_book', 'series_book.series_id', 'series.id')
			.innerJoin('release_book', 'release_book.book_id', 'series_book.book_id')
			.innerJoin('release_publisher', 'release_publisher.release_id', 'release_book.release_id')
			.innerJoin('release', 'release.id', 'release_book.release_id')
			.where('release_publisher.publisher_id', '=', publisherId)
			.where('series.hidden', '=', false)
			.where('release.hidden', '=', false)
			.groupBy(['series.id']);
	}

	getReleasesBelongingToPublisher(publisherId: number) {
		return this.ranobeDB.db
			.selectFrom('publisher')
			.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
			.innerJoin('release', 'release.id', 'release_publisher.release_id')
			.selectAll('release')
			.select('release_publisher.publisher_type')
			.where('release.hidden', '=', false)
			.where('publisher.id', '=', publisherId)
			.orderBy('release.release_date desc');
	}

	async getWorksPaged(params: {
		id: number;
		currentPage: number;
		tab: (typeof publisherTabs)[number];
	}) {
		const { id, currentPage, tab } = params;
		let works: PublisherWorks;
		let count;
		let totalPages;
		if (tab === 'books') {
			const booksQuery = this.getBooksBelongingToPublisher(id);
			const {
				result: books,
				count: countBooks,
				totalPages: totalPagesBooks,
			} = await paginationBuilderExecuteWithCount(
				booksQuery,
				{
					limit: 24,
					page: currentPage,
				},
				this.getBooksBelongingToPublisherCount(id),
			);
			count = countBooks;
			totalPages = totalPagesBooks;
			works = {
				type: tab,
				books,
			};
		} else if (tab === 'series') {
			const seriesQuery = this.getSeriesBelongingToPublisher(id);
			const {
				result: series,
				count: countSeries,
				totalPages: totalPagesSeries,
			} = await paginationBuilderExecuteWithCount(
				seriesQuery,
				{
					limit: 24,
					page: currentPage,
				},
				this.getSeriesBelongingToPublisherCount(id),
			);
			count = countSeries;
			totalPages = totalPagesSeries;
			works = {
				type: tab,
				series,
			};
		} else {
			const releasesQuery = this.getReleasesBelongingToPublisher(id);
			const {
				result: releases,
				count: countSeries,
				totalPages: totalPagesSeries,
			} = await paginationBuilderExecuteWithCount(releasesQuery, {
				limit: 24,
				page: currentPage,
			});
			count = countSeries;
			totalPages = totalPagesSeries;
			works = {
				type: tab,
				releases,
			};
		}
		return { count, totalPages, currentPage, works };
	}
}

export type Publisher = InferResult<ReturnType<DBPublishers['getPublisher']>>[number];
export type PublisherEdit = InferResult<ReturnType<DBPublishers['getPublisherEdit']>>[number];
export type PublisherReleases = InferResult<
	ReturnType<DBPublishers['getReleasesBelongingToPublisher']>
>[number];
export type PublisherBook = InferResult<
	ReturnType<DBPublishers['getBooksBelongingToPublisher']>
>[number];
export type PublisherSeries = InferResult<
	ReturnType<DBPublishers['getSeriesBelongingToPublisher']>
>[number];

type PublisherBooksWork = {
	type: 'books';
	books: PublisherBook[];
};
type PublisherSeriesWorks = {
	type: 'series';
	series: PublisherSeries[];
};
type PublisherReleasesWorks = {
	type: 'releases';
	releases: PublisherReleases[];
};
export type PublisherWorks = PublisherBooksWork | PublisherSeriesWorks | PublisherReleasesWorks;
