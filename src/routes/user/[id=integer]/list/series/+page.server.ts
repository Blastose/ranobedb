import { addCharacterBetweenString } from '$lib/db/match.js';
import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { listLabelsSchema, pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { sql, type Expression, type SqlBool } from 'kysely';
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

	const userLabelCounts = await db
		.selectFrom('user_list_series')
		.leftJoin('user_list_series_label', (join) =>
			join
				.onRef('user_list_series_label.user_id', '=', 'user_list_series.user_id')
				.onRef('user_list_series_label.series_id', '=', 'user_list_series.series_id')
				.on('user_list_series.user_id', '=', listUser.id),
		)
		.fullJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_series.user_id')
				.onRef('user_list_label.id', '=', 'user_list_series_label.label_id'),
		)
		.leftJoin('series', 'series.id', 'user_list_series.series_id')
		.select((eb) => eb.fn.coalesce('user_list_label.label', sql<string>`'No label'`).as('label'))
		.select((eb) => eb.fn.count('user_list_series.series_id').as('count'))
		.select((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`9999`).as('label_id'))
		.where((eb) =>
			eb.or([
				eb('user_list_series.user_id', '=', listUser.id),
				eb('user_list_series.user_id', 'is', null),
			]),
		)
		.where('user_list_label.user_id', '=', listUser.id)
		.where((eb) => eb.or([eb('series.hidden', '=', false), eb('series.hidden', 'is', null)]))
		.groupBy(['user_list_label.label', 'user_list_label.id'])
		.orderBy((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`99999`))
		.execute();

	const dbSeries = DBSeries.fromDB(db, user);
	let query = dbSeries
		.getSeries()
		.innerJoin('user_list_series', 'cte_series.id', 'user_list_series.series_id')
		.innerJoin('user_list_series_label', (join) =>
			join
				.onRef('user_list_series_label.series_id', '=', 'user_list_series.series_id')
				.onRef('user_list_series_label.user_id', '=', 'user_list_series.user_id'),
		)
		.innerJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_series.user_id')
				.on((eb) => eb.between('user_list_label.id', 1, 10))
				.onRef('user_list_label.id', '=', 'user_list_series_label.label_id'),
		)
		.where('user_list_series.user_id', '=', listUser.id)
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

	if (labels.length > 0) {
		query = query.where((eb) => {
			const ors: Expression<SqlBool>[] = [];
			for (const l of labels) {
				ors.push(eb('user_list_series_label.label_id', '=', l));
			}

			return eb.or(ors);
		});
	}

	const {
		result: user_list_series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	const isMyList = user?.id_numeric === userIdNumeric;
	const listCounts = await getUserListCounts({ userId: listUser.id });

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
