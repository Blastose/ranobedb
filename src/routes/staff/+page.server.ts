import { db } from '$lib/server/db/db.js';
import { getStaff } from '$lib/server/db/staff/query.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;
	const qS = await superValidate(url, zod(qSchema));
	const q = qS.data.q;

	const res = await getStaff({
		currentPage,
		db,
		q,
		url,
		currentUser: locals.user,
		listUser: null,
		limit: 40,
	});

	return {
		staff: res.staff,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
	};
};
