import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import { type InferResult } from 'kysely';
import { withBookTitleCte } from '../books/books';

export const getStaff = db
	.selectFrom('staff')
	.innerJoin('staff_alias', (join) =>
		join.onRef('staff_alias.staff_id', '=', 'staff.id').on('staff_alias.main_alias', '=', true)
	)
	.selectAll('staff')
	.select(['staff_alias.name', 'staff_alias.romaji']);

export const getStaffOne = (id: number) => {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('staff')
		.innerJoin('staff_alias', (join) =>
			join.onRef('staff_alias.staff_id', '=', 'staff.id').on('staff_alias.main_alias', '=', true)
		)
		.selectAll('staff')
		.select(['staff_alias.name', 'staff_alias.romaji'])
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('staff_alias as all_aliases')
					.whereRef('all_aliases.staff_id', '=', 'staff.id')
					.where('all_aliases.main_alias', '=', false)
					.selectAll('all_aliases')
			).as('aliases')
		)
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('cte_book')
					.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'cte_book.id')
					.innerJoin('staff_alias', (join) =>
						join
							.onRef('staff_alias.id', '=', 'book_staff_alias.staff_alias_id')
							.onRef('staff_alias.id', '=', 'staff.id')
					)
					.whereRef('staff_alias.id', '=', 'staff.id')
					.select([
						'cte_book.id',
						'staff_alias.name',
						'staff_alias.main_alias',
						'staff_alias.staff_id',
						'book_staff_alias.note',
						'book_staff_alias.role_type',
						'cte_book.title',
						'cte_book.title_orig',
						'cte_book.romaji',
						'cte_book.romaji_orig'
					])
			).as('books')
		)
		.where('staff.id', '=', id);
};

export const getStaffHistOne = (options: { id: number; revision: number }) => {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('staff_hist')
		.innerJoin('staff_alias_hist', (join) =>
			join
				.onRef('staff_alias_hist.change_id', '=', 'staff_hist.change_id')
				.on('staff_alias_hist.main_alias', '=', true)
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
						'all_aliases.romaji'
					])
			).as('aliases')
		)
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('cte_book')
					.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'cte_book.id')
					.innerJoin('staff_alias', (join) =>
						join
							.onRef('staff_alias.id', '=', 'book_staff_alias.staff_alias_id')
							.on('staff_alias.id', '=', options.id)
					)
					.where('staff_alias.id', '=', options.id)
					.select([
						'cte_book.id',
						'staff_alias.name',
						'staff_alias.main_alias',
						'staff_alias.staff_id',
						'book_staff_alias.note',
						'book_staff_alias.role_type',
						'cte_book.title',
						'cte_book.title_orig',
						'cte_book.romaji',
						'cte_book.romaji_orig'
					])
			).as('books')
		)
		.where('change.item_id', '=', options.id)
		.where('change.item_name', '=', 'staff')
		.where('change.revision', '=', options.revision);
};

export const getStaffOneEdit = (id: number) => {
	return db
		.selectFrom('staff')
		.innerJoin('staff_alias', (join) =>
			join.onRef('staff_alias.staff_id', '=', 'staff.id').on('staff_alias.main_alias', '=', true)
		)
		.selectAll('staff')
		.select(['staff_alias.name', 'staff_alias.romaji'])
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('staff_alias as all_aliases')
					.whereRef('all_aliases.staff_id', '=', 'staff.id')
					.select([
						'all_aliases.id as aid',
						'all_aliases.staff_id',
						'all_aliases.main_alias',
						'all_aliases.name',
						'all_aliases.romaji'
					])
			).as('aliases')
		)
		.where('staff.id', '=', id);
};

export const getStaffHistOneEdit = (params: { id: number; revision: number }) => {
	return db
		.selectFrom('staff_hist')
		.innerJoin('staff_alias_hist', (join) =>
			join
				.onRef('staff_alias_hist.change_id', '=', 'staff_hist.change_id')
				.on('staff_alias_hist.main_alias', '=', true)
		)
		.innerJoin('change', 'change.id', 'staff_hist.change_id')
		.select(['staff_hist.change_id as id', 'staff_hist.description', 'staff_hist.bookwalker_id'])
		.select(['staff_alias_hist.name', 'staff_alias_hist.romaji'])
		.select(['change.ihid as hidden', 'change.ilock as locked'])
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('staff_alias_hist as all_aliases')
					.leftJoin('staff', 'staff.id', 'all_aliases.aid')
					.whereRef('all_aliases.change_id', '=', 'staff_hist.change_id')
					.select([
						'all_aliases.change_id as staff_id',
						'all_aliases.aid',
						'all_aliases.main_alias',
						'all_aliases.name',
						'all_aliases.romaji',
						'staff.id as staff_id_real'
					])
			).as('aliases')
		)
		.where('change.item_id', '=', params.id)
		.where('change.item_name', '=', 'staff')
		.where('change.revision', '=', params.revision);
};

export type Staff = InferResult<ReturnType<typeof getStaffOne>>[number];
export type StaffEdit = InferResult<ReturnType<typeof getStaffOneEdit>>[number];
