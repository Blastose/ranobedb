import { addCharacterBetweenString } from '$lib/db/match.js';
import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { getUserSeriesListCounts } from '$lib/server/db/user/series-list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { listLabelsSchema, pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { sql } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;
	const listLabels = await superValidate(url, zod(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : [];

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const userLabelCounts = await getUserSeriesListCounts(db, listUser.id).execute();

	const dbSeries = DBSeries.fromDB(db, user);
	let query = dbSeries
		.getSeriesUser(listUser.id, labels)
		.where('cte_series.hidden', '=', false)
		.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_series.romaji', 'cte_series.title')} COLLATE numeric`,
		);

	if (q) {
		query = query.where((eb) =>
			eb.or([
				eb('cte_series.title', 'ilike', addCharacterBetweenString(q, '%')),
				eb('cte_series.romaji', 'ilike', addCharacterBetweenString(q, '%')),
			]),
		);
	}
	const isMyList = user?.id_numeric === userIdNumeric;

	const [{ result: user_list_series, count, totalPages }, listCounts] = await Promise.all([
		paginationBuilderExecuteWithCount(query, {
			limit: 24,
			page: currentPage,
		}),
		getUserListCounts({ userId: listUser.id }),
	]);

	return {
		isMyList,
		listUser,
		user_list_series,
		count,
		totalPages,
		currentPage,
		labels,
		userLabelCounts,
		listCounts,
	};
};
