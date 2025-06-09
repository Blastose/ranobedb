import { db } from '$lib/server/db/db.js';
import { pageSchema, qSchema, queryLimitSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getPublishers } from '$lib/server/db/publishers/query';

async function get(params: { url: URL; locals: App.Locals }) {
	const { url, locals } = params;
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const limit = await superValidate(url, zod(queryLimitSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const res = await getPublishers({
		currentPage,
		db,
		q,
		url,
		currentUser: locals.user,
		limit: limit.data.limit,
		listUser: null,
	});

	return {
		publishers: res.publishers,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
	};
}

export type PublishersApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await get({ url, locals }));
};
