import { db } from '$lib/server/db/db.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries.getSeriesOne(id).executeTakeFirst();

	if (!series) {
		error(404);
	}

	return {
		series,
	};
};
