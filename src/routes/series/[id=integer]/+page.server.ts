import { getSeriesOne } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);
	const series = await getSeriesOne(id).executeTakeFirst();

	if (!series) {
		error(404);
	}

	return {
		series
	};
};
