import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { RanobeDB } from '$lib/server/db/db';
import { Kysely, sql, type InferResult } from 'kysely';
import { DBBooks, withBookTitleCte } from '../books/books';
import type { DB, StaffRole } from '$lib/server/db/dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { DBSeries } from '../series/series';
import type { staffTabs } from '$lib/db/dbConsts';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';

export class DBStaff {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	getStaff() {
		return this.ranobeDB.db
			.selectFrom('staff')
			.innerJoin('staff_alias', (join) =>
				join.onRef('staff_alias.staff_id', '=', 'staff.id').on('staff_alias.main_alias', '=', true),
			)
			.select(['staff.id'])
			.select(['staff_alias.name', 'staff_alias.romaji']);
	}

	getStaffOne(id: number) {
		return this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte())
			.selectFrom('staff')
			.innerJoin('staff_alias', (join) =>
				join.onRef('staff_alias.staff_id', '=', 'staff.id').on('staff_alias.main_alias', '=', true),
			)
			.selectAll('staff')
			.select(['staff_alias.name', 'staff_alias.romaji'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias as all_aliases')
						.whereRef('all_aliases.staff_id', '=', 'staff.id')
						.selectAll('all_aliases')
						.orderBy((eb) => eb.fn.coalesce('all_aliases.romaji', 'all_aliases.name')),
				).as('aliases'),
			)
			.where('staff.id', '=', id);
	}

	getStaffHistOne(options: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte())
			.selectFrom('staff_hist')
			.innerJoin('staff_alias_hist', (join) =>
				join
					.onRef('staff_alias_hist.change_id', '=', 'staff_hist.change_id')
					.on('staff_alias_hist.main_alias', '=', true),
			)
			.innerJoin('change', 'change.id', 'staff_hist.change_id')
			.select([
				'staff_hist.change_id as id',
				'staff_hist.description',
				'staff_hist.bookwalker_id',
				'staff_hist.bookwalker_gl_id',
				'staff_hist.pixiv_id',
				'staff_hist.twitter_id',
				'staff_hist.website',
				'staff_hist.wikidata_id',
				'staff_hist.syosetu_id',
				'staff_hist.kakuyomu_id',
				'staff_hist.bsky_id',
			])
			.select(['staff_alias_hist.name', 'staff_alias_hist.romaji'])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias_hist as all_aliases')
						.whereRef('all_aliases.change_id', '=', 'staff_hist.change_id')
						.select([
							'all_aliases.change_id as staff_id',
							'all_aliases.aid as id',
							'all_aliases.main_alias',
							'all_aliases.name',
							'all_aliases.romaji',
						])
						.orderBy((eb) => eb.fn.coalesce('all_aliases.romaji', 'all_aliases.name')),
				).as('aliases'),
			)
			.where('change.item_id', '=', options.id)
			.where('change.item_name', '=', 'staff');
		if (options.revision) {
			query = query.where('change.revision', '=', options.revision);
		} else {
			query = query.orderBy('change.revision', 'desc');
		}
		return query;
	}

	getStaffOneEdit(id: number) {
		return this.ranobeDB.db
			.selectFrom('staff')
			.innerJoin('staff_alias', (join) =>
				join.onRef('staff_alias.staff_id', '=', 'staff.id').on('staff_alias.main_alias', '=', true),
			)
			.selectAll('staff')
			.select(['staff_alias.name', 'staff_alias.romaji'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias as all_aliases')
						.leftJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'all_aliases.id')
						.leftJoin('book', (join) =>
							join.onRef('book.id', '=', 'book_staff_alias.book_id').on('book.hidden', '=', false),
						)
						.whereRef('all_aliases.staff_id', '=', 'staff.id')
						.distinctOn('all_aliases.id')
						.select([
							'all_aliases.id as aid',
							'all_aliases.staff_id',
							'all_aliases.main_alias',
							'all_aliases.name',
							'all_aliases.romaji',
							'book.id as ref_book_id',
						])
						.orderBy('all_aliases.id')
						.orderBy('book.hidden'),
				).as('aliases'),
			)
			.where('staff.id', '=', id);
	}

	getStaffHistOneEdit(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.selectFrom('staff_hist')
			.innerJoin('staff_alias_hist', (join) =>
				join
					.onRef('staff_alias_hist.change_id', '=', 'staff_hist.change_id')
					.on('staff_alias_hist.main_alias', '=', true),
			)
			.innerJoin('change', 'change.id', 'staff_hist.change_id')
			.select([
				'staff_hist.change_id as id',
				'staff_hist.description',
				'staff_hist.bookwalker_id',
				'staff_hist.bookwalker_gl_id',
				'staff_hist.pixiv_id',
				'staff_hist.twitter_id',
				'staff_hist.website',
				'staff_hist.wikidata_id',
				'staff_hist.syosetu_id',
				'staff_hist.kakuyomu_id',
				'staff_hist.bsky_id',
			])
			.select(['staff_alias_hist.name', 'staff_alias_hist.romaji'])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias_hist as all_aliases')
						.leftJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'all_aliases.aid')
						.leftJoin('book', (join) =>
							join.onRef('book.id', '=', 'book_staff_alias.book_id').on('book.hidden', '=', false),
						)
						.whereRef('all_aliases.change_id', '=', 'staff_hist.change_id')
						.distinctOn('all_aliases.aid')
						.select([
							'all_aliases.change_id as staff_id',
							'all_aliases.aid',
							'all_aliases.main_alias',
							'all_aliases.name',
							'all_aliases.romaji',
							'book.id as ref_book_id',
						])
						.orderBy('all_aliases.aid')
						.orderBy('book.hidden'),
				).as('aliases'),
			)
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'staff');
		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision', 'desc');
		}
		return query;
	}

	getBooksBelongingToStaff(staffId: number) {
		return DBBooks.fromDB(this.ranobeDB.db, this.ranobeDB.user)
			.getBooks()
			.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'cte_book.id')
			.innerJoin('staff_alias', (join) =>
				join
					.onRef('staff_alias.id', '=', 'book_staff_alias.staff_alias_id')
					.on('staff_alias.staff_id', '=', staffId),
			)
			.clearSelect()
			.select([
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'staff_alias.name',
				'staff_alias.main_alias',
				'staff_alias.staff_id',
				'book_staff_alias.note',
			])
			.select(({ fn, cast }) => [
				fn
					.agg<StaffRole[]>('array_agg', [cast('book_staff_alias.role_type', 'text')])
					.distinct()
					.as('role_types'),
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
			.groupBy([
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.c_release_date',
				'staff_alias.name',
				'staff_alias.main_alias',
				'staff_alias.staff_id',
				'book_staff_alias.note',
			])
			.orderBy('cte_book.c_release_date', 'desc')
			.orderBy(
				(eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'),
				(ob) => ob.collate('numeric').asc(),
			);
	}

	getSeriesBelongingToStaff(staffId: number) {
		return DBSeries.fromDB(this.ranobeDB.db, this.ranobeDB.user)
			.getSeries()
			.innerJoin('series_book', 'series_book.series_id', 'cte_series.id')
			.innerJoin('book', 'book.id', 'series_book.book_id')
			.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'series_book.book_id')
			.innerJoin('staff_alias', (join) =>
				join
					.onRef('staff_alias.id', '=', 'book_staff_alias.staff_alias_id')
					.on('staff_alias.staff_id', '=', staffId),
			)
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
					.agg<StaffRole[]>('array_agg', [cast('book_staff_alias.role_type', 'text')])
					.distinct()
					.as('role_types'),
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
						.where('book.hidden', '=', false)
						.whereRef('sb2.book_id', '=', 'book.id')
						.orderBy('sb2.sort_order', 'asc')
						.limit(1),
				).as('book'),
			])
			.where('cte_series.hidden', '=', false)
			.where('book.hidden', '=', false)
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
				'cte_series.c_start_date',
			])
			.orderBy('cte_series.c_start_date', 'desc')
			.orderBy(
				(eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'),
				(ob) => ob.collate('numeric').asc(),
			);
	}

	async getWorksPaged(params: {
		id: number;
		currentPage: number;
		tab: (typeof staffTabs)[number];
	}) {
		const { id, currentPage, tab } = params;
		let count;
		let totalPages;
		let works: StaffWorks;
		if (tab === 'books') {
			const booksQuery = this.getBooksBelongingToStaff(id);
			const {
				result: books,
				count: countBooks,
				totalPages: totalPagesBooks,
			} = await paginationBuilderExecuteWithCount(booksQuery, {
				limit: 24,
				page: currentPage,
			});
			count = countBooks;
			totalPages = totalPagesBooks;
			works = {
				type: tab,
				books,
			};
		} else {
			const seriesQuery = this.getSeriesBelongingToStaff(id);
			const {
				result: series,
				count: countSeries,
				totalPages: totalPagesSeries,
			} = await paginationBuilderExecuteWithCount(seriesQuery, {
				limit: 24,
				page: currentPage,
			});
			count = countSeries;
			totalPages = totalPagesSeries;
			works = {
				type: tab,
				series,
			};
		}
		return {
			works,
			count,
			totalPages,
			currentPage,
		};
	}
}

export type Staff = InferResult<ReturnType<DBStaff['getStaffOne']>>[number];
export type StaffEdit = InferResult<ReturnType<DBStaff['getStaffOneEdit']>>[number];
export type StaffBook = InferResult<ReturnType<DBStaff['getBooksBelongingToStaff']>>[number];
export type StaffSeries = InferResult<ReturnType<DBStaff['getSeriesBelongingToStaff']>>[number];

type StaffBooksWork = {
	type: 'books';
	books: StaffBook[];
};
type StaffSeriesWorks = {
	type: 'series';
	series: StaffSeries[];
};
export type StaffWorks = StaffBooksWork | StaffSeriesWorks;
