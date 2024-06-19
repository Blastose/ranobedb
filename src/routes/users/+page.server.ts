import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const q = url.searchParams.get('q');

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
