import { db } from '$lib/server/db/db';
import { DBSeries } from '$lib/server/db/series/series.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const dbSeries = DBSeries.fromDB(db, user);
	const user_list_series = await dbSeries
		.getSeries()
		.innerJoin('user_list_series', 'cte_series.id', 'user_list_series.series_id')
		.where('user_list_series.user_id', '=', listUser.id)
		.execute();

	const isMyList = user?.id_numeric === userIdNumeric;

	return {
		isMyList,
		listUser,
		user_list_series,
	};
};
