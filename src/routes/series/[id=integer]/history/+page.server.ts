import { getChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const seriesId = Number(id);

	const changes = await getChanges('series', seriesId).execute();
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries.getSeriesOne(seriesId).executeTakeFirstOrThrow();
	if (!series) {
		error(404);
	}

	return { changes, series };
};
