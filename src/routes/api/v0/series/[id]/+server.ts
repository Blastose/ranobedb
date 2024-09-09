import { db } from '$lib/server/db/db.js';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { DBSeries } from '$lib/server/db/series/series';

async function get(params: { id: number; locals: App.Locals }) {
	const { id, locals } = params;
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries.getSeriesOne(id).limit(1).executeTakeFirst();

	if (!series || series.hidden) {
		error(404);
	}

	return {
		series,
	};
}

export type SeriesOneApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ params, locals }) => {
	return json(await get({ id: Number(params.id), locals }));
};
