import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { getBooksRL, getUserLabelCounts } from '$lib/server/db/user/list';
import { error } from '@sveltejs/kit';
import type { Expression, SqlBool } from 'kysely';

export const load = async ({ url, params, locals }) => {
	const session = await locals.auth.validate();
	const user = session?.user;
	const listUserUsername = params.username;
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');
	const labels = url.searchParams.getAll('l').map((l) => Number(l) || 1);

	const listUser = await db
		.selectFrom('auth_user')
		.select(['auth_user.username', 'auth_user.id'])
		.where('auth_user.username', '=', listUserUsername)
		.executeTakeFirst();

	if (!listUser) {
		throw error(404);
	}

	const userLabelCounts = await getUserLabelCounts(listUser.id).execute();

	let k = getBooksRL(listUser.id);

	if (query) {
		k = k.where('cte_book.title', 'ilike', `%${query}%`);
	}

	if (labels.length > 0) {
		k = k.where((eb) => {
			const ors: Expression<SqlBool>[] = [];
			for (const l of labels) {
				ors.push(eb('label_id', '=', l));
			}

			return eb.or(ors);
		});
	}

	const {
		result: books,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(k, {
		limit: 24,
		page: currentPage
	});

	return {
		books,
		count,
		currentPage,
		totalPages,
		userLabelCounts,
		isMyList: user?.username === listUserUsername,
		listUser
	};
};
