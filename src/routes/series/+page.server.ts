import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const dbSeries = DBSeries.fromDB(db, locals.user);

	let query = dbSeries.getSeries().where('cte_series.hidden', '=', false);
	const useQuery = true;

	if (q) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb('cte_series.id', 'in', (eb) =>
				eb
					.selectFrom('series')
					.$if(useQuery, (qb) =>
						qb
							.innerJoin('series_title', (join) =>
								join.onRef('series_title.series_id', '=', 'series.id'),
							)
							.where((eb2) =>
								eb2.or([
									eb2('series_title.title', 'ilike', `%${q}%`),
									eb2('series_title.romaji', 'ilike', `%${q}%`),
								]),
							),
					)
					.select('series.id'),
			),
		);
	}

	query = query.orderBy((eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'));

	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		series,
		count,
		currentPage,
		totalPages,
	};
};
