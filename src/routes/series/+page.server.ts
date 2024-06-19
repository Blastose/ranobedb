import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const dbSeries = DBSeries.fromDB(db, locals.user);

	let query = dbSeries.getSeries().where('cte_series.hidden', '=', false);
	if (q) {
		query = query.where('cte_series.title', 'ilike', `%${q}%`);
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
