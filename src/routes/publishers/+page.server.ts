import { db } from '$lib/server/db/db.js';
import { getPublishers } from '$lib/server/db/publishers/query.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const res = await getPublishers({
		currentPage,
		db,
		q,
		url,
		currentUser: locals.user,
		limit: 40,
	});

	return {
		publishers: res.publishers,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
	};
};
