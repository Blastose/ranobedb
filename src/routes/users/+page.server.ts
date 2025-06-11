import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	let query = db
		.selectFrom('auth_user')
		.select(['auth_user.id_numeric', 'auth_user.joined', 'auth_user.username']);

	if (q) {
		query = query.where('auth_user.username_lowercase', 'ilike', `%${q}%`);
	}

	query = query.orderBy('auth_user.id_numeric', 'asc');

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
