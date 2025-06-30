import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { readingLogSchema } from '$lib/server/zod/schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import dayjs from 'dayjs';
import { sql } from 'kysely';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const load = async ({ params, locals, url }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const listUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);

	const form = await superValidate(url, zod4(readingLogSchema));

	if (!listUser) {
		error(404);
	}

	let isCurrentUser = false;
	if (user?.id_numeric === listUser.id_numeric) {
		isCurrentUser = true;
	}

	let query = DBBooks.fromDB(db)
		.getBooks()
		.innerJoin('user_list_book', 'user_list_book.book_id', 'cte_book.id')
		.select(['user_list_book.finished', 'user_list_book.score'])
		.where('user_list_book.user_id', '=', listUser.id)
		.orderBy('user_list_book.finished', 'desc')
		.orderBy('user_list_book.last_updated', 'desc');

	const year = form.data.date[0];
	const month = form.data.date[1];

	const d = dayjs(new Date(year, month - 1, 1));

	const nextMonth = d.add(1, 'month');
	const prevMonth = d.subtract(1, 'month');
	const currentMonth = d;

	query = query.where(
		'user_list_book.finished',
		'>=',
		`${year}-${month.toString().padStart(2, '0')}-01`,
	);
	query = query.where(
		'user_list_book.finished',
		'<',
		`${nextMonth.get('year')}-${(nextMonth.get('month') + 1).toString().padStart(2, '0')}-01`,
	);

	const books = await query.execute();

	const readPerMonthQuery = await db
		.selectFrom((eb) =>
			eb
				.fn('generate_series', [
					sql`date_trunc('month', ${currentMonth.format('YYYY-MM-DD')}::date)::date - '6 month'::interval, date_trunc('month', ${currentMonth.format('YYYY-MM-DD')}::date + '6 month'::interval)::date, interval '1 month'`,
				])
				.as('gs'),
		)
		.leftJoin('user_list_book', (join) =>
			join.on((eb) =>
				eb.and([
					eb(
						eb.fn('date_trunc', [eb.val('month'), 'user_list_book.finished']),
						'=',
						eb.cast<string>(eb.fn('date_trunc', [eb.val('month'), sql`gs`]), 'date'),
					),
					eb('user_list_book.user_id', '=', listUser.id),
				]),
			),
		)
		.select((eb) => [
			eb.cast<string>(eb.fn('date_trunc', [eb.val('month'), sql`gs`]), 'date').as('date'),
			eb
				.cast<number>(eb.fn.coalesce(eb.fn.count('user_list_book.book_id'), sql<number>`0`), 'int4')
				.as('count'),
		])
		.groupBy('date')
		.orderBy('date')
		.execute();

	const readPerMonthQueryMap = readPerMonthQuery.map((v) => ({
		...v,
		monthName: dayjs(v.date, 'YYYY-MM-DD').format('MMM'),
		monthYear: dayjs(v.date, 'YYYY-MM-DD').format('YY'),
	}));

	return {
		listUser,
		isCurrentUser,
		books,
		nextMonth: nextMonth.format('YYYY-MM'),
		prevMonth: prevMonth.format('YYYY-MM'),
		currentMonth: currentMonth.format('YYYY-MM'),
		currentMonthName: currentMonth.format('MMMM'),
		currentYearName: currentMonth.format('YYYY'),
		readPerMonthQuery: readPerMonthQueryMap,
	};
};
