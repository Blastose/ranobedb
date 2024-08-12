import { db } from '$lib/server/db/db.js';
import { getUserLabelCounts } from '$lib/server/db/user/list.js';
import { getUserSeriesListCounts } from '$lib/server/db/user/series-list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { sql } from 'kysely';

export const load = async ({ params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const listUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);

	let isCurrentUser = false;
	if (user?.id_numeric === listUser.id_numeric) {
		isCurrentUser = true;
	}

	// TODO - Maybe use `MAKE_DATE()` instead of `DATE_TRUNC()`?
	const readPerMonthQuery = db
		.selectFrom((eb) =>
			eb
				.fn('generate_series', [
					sql`date_trunc('month', 'now'::date)::date - '12 month'::interval, date_trunc('month', 'now'::date)::date, interval '1 month'`,
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
		.orderBy('date');

	const labelCounts = await getUserLabelCounts(listUser.id).execute();
	const seriesLabelCounts = await getUserSeriesListCounts(db, listUser.id).execute();

	const readPerMonth = await readPerMonthQuery.execute();

	return {
		listUser,
		isCurrentUser,
		readPerMonth,
		labelCounts,
		seriesLabelCounts,
	};
};
