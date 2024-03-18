import { getChanges } from '$lib/server/db/change/change.js';
import { getSeriesOne } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = params.id;
	const seriesId = Number(id);

	const changes = await getChanges('series', seriesId).execute();

	const series = await getSeriesOne(seriesId).executeTakeFirstOrThrow();
	if (!series) {
		error(404);
	}

	return { changes, series };
};
