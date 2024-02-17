import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import type { InferResult } from 'kysely';

export const getStaff = db
	.selectFrom('staff')
	.innerJoin('staff_alias', 'staff_alias.staff_id', 'staff.id')
	.selectAll('staff')
	.selectAll('staff_alias')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('book')
				.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'book.id')
				.innerJoin('staff_alias', (join) =>
					join
						.onRef('staff_alias.id', '=', 'book_staff_alias.staff_alias_id')
						.onRef('staff_alias.id', '=', 'staff.id')
				)
				.whereRef('staff_alias.id', '=', 'staff.id')
				.select([
					'book.id',
					'staff_alias.name',
					'staff_alias.main_alias',
					'staff_alias.staff_id',
					'book_staff_alias.role_type'
				])
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom('book_title')
							.whereRef('book_title.book_id', '=', 'book.id')
							.select(['book_title.title', 'book_title.lang', 'book_title.official'])
					).as('titles')
				])
		).as('books')
	]);

export type Staff = InferResult<typeof getStaff>[number];
