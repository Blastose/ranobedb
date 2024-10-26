import { db } from '$lib/server/db/db.js';
import { pageSchema, qSchema, seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getSeries } from '$lib/server/db/series/query';

async function get(params: { url: URL; locals: App.Locals }) {
	const { url, locals } = params;
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));
	const form = await superValidate(url, zod(seriesFiltersSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const res = await getSeries({
		currentPage,
		db,
		q,
		url,
		listUser: null,
		currentUser: locals.user,
		form,
		limit: form.data.limit,
	});

	return {
		series: res.series,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
	};
}

export type SeriesApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await get({ url, locals }));
};
