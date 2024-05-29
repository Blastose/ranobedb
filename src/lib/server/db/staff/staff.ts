import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { RanobeDB } from '$lib/server/db/db';
import { Kysely, type InferResult } from 'kysely';
import { DBBooks, withBookTitleCte } from '../books/books';
import type { DB, StaffRole } from '$lib/server/db/dbTypes';
import type { User } from 'lucia';
import { DBSeries } from '../series/series';

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
			.selectAll('staff')
			.select(['staff_alias.name', 'staff_alias.romaji']);
	}

	getStaffOne(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte())
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
						.where('all_aliases.main_alias', '=', false)
						.selectAll('all_aliases'),
				).as('aliases'),
			)
			.where('staff.id', '=', id);
	}

	getStaffHistOne(options: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookTitleCte())
			.selectFrom('staff_hist')
			.innerJoin('staff_alias_hist', (join) =>
				join
					.onRef('staff_alias_hist.change_id', '=', 'staff_hist.change_id')
					.on('staff_alias_hist.main_alias', '=', true),
			)
			.innerJoin('change', 'change.id', 'staff_hist.change_id')
			.select(['staff_hist.change_id as id', 'staff_hist.description', 'staff_hist.bookwalker_id'])
			.select(['staff_alias_hist.name', 'staff_alias_hist.romaji'])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias_hist as all_aliases')
						.whereRef('all_aliases.change_id', '=', 'staff_hist.change_id')
						.where('all_aliases.main_alias', '=', false)
						.select([
							'all_aliases.change_id as staff_id',
							'all_aliases.aid as id',
							'all_aliases.main_alias',
							'all_aliases.name',
							'all_aliases.romaji',
						]),
				).as('aliases'),
			)
			.where('change.item_id', '=', options.id)
			.where('change.item_name', '=', 'staff');
		if (options.revision) {
			query = query.where('change.revision', '=', options.revision);
		} else {
			query = query.orderBy('change.revision desc');
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
						.whereRef('all_aliases.staff_id', '=', 'staff.id')
						.distinctOn('all_aliases.id')
						.select([
							'all_aliases.id as aid',
							'all_aliases.staff_id',
							'all_aliases.main_alias',
							'all_aliases.name',
							'all_aliases.romaji',
							'book_staff_alias.book_id as ref_book_id',
						]),
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
			.select(['staff_hist.change_id as id', 'staff_hist.description', 'staff_hist.bookwalker_id'])
			.select(['staff_alias_hist.name', 'staff_alias_hist.romaji'])
			.select(['change.ihid as hidden', 'change.ilock as locked'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias_hist as all_aliases')
						.leftJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'all_aliases.aid')
						.whereRef('all_aliases.change_id', '=', 'staff_hist.change_id')
						.distinctOn('all_aliases.aid')
						.select([
							'all_aliases.change_id as staff_id',
							'all_aliases.aid',
							'all_aliases.main_alias',
							'all_aliases.name',
							'all_aliases.romaji',
							'book_staff_alias.book_id as ref_book_id',
						]),
				).as('aliases'),
			)
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'staff');
		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision desc');
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
			.where('staff_alias.staff_id', '=', staffId)
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
			.groupBy([
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
			]);
	}

	getSeriesBelongingToStaff(staffId: number) {
		return DBSeries.fromDB(this.ranobeDB.db, this.ranobeDB.user)
			.getSeries()
			.innerJoin('series_book', 'series_book.series_id', 'cte_series.id')
			.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'series_book.book_id')
			.innerJoin('staff_alias', (join) =>
				join
					.onRef('staff_alias.id', '=', 'book_staff_alias.staff_alias_id')
					.on('staff_alias.staff_id', '=', staffId),
			)
			.where('staff_alias.staff_id', '=', staffId)
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
						.selectFrom('book')
						.innerJoin('series_book as sb2', 'sb2.series_id', 'cte_series.id')
						.whereRef('sb2.book_id', '=', 'book.id')
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
						.orderBy('sb2.sort_order asc')
						.limit(1),
				).as('book'),
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
