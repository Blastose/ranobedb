import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qq = await superValidate(url, zod(qSchema));
	console.log(page);

	if (!page.valid || !qq.valid) {
		error(400);
	}

	const currentPage = page.data.page;
	const q = qq.data.q;

	let query = db
		.selectFrom('auth_user')
		.select(['auth_user.id_numeric', 'auth_user.joined', 'auth_user.username']);

	if (q) {
		query = query.where('auth_user.username_lowercase', 'ilike', `%${q}%`);
	}

	query = query.orderBy('auth_user.id_numeric asc');

	const {
		result: users,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return { users, count, currentPage, totalPages };
};
