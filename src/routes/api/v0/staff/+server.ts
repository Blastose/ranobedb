import { db } from '$lib/server/db/db.js';
import { pageSchema, qSchema, queryLimitSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getStaff } from '$lib/server/db/staff/query';

async function get(params: { url: URL; locals: App.Locals }) {
	const { url, locals } = params;
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;
	const qS = await superValidate(url, zod(qSchema));
	const q = qS.data.q;
	const limit = await superValidate(url, zod(queryLimitSchema));

	const res = await getStaff({
		currentPage,
		db,
		q,
		url,
		currentUser: locals.user,
		listUser: null,
		limit: limit.data.limit,
	});

	return {
		staff: res.staff,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
	};
}

export type StaffApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await get({ url, locals }));
};
