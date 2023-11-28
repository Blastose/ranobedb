import { getBooks2 } from '$lib/server/db/books/books';
import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { getUserLabelCounts } from '$lib/server/db/user/list';
import { error } from '@sveltejs/kit';

export const load = async ({ url, params, locals }) => {
	const session = await locals.auth.validate();
	const user = session?.user;
	const listUserUsername = params.username;
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');

	const listUser = await db
		.selectFrom('auth_user')
		.select(['auth_user.username', 'auth_user.id'])
		.where('auth_user.username', '=', listUserUsername)
		.executeTakeFirst();

	if (!listUser) {
		throw error(404);
	}

	const userLabelCounts = await getUserLabelCounts(listUser.id).execute();
	console.log(userLabelCounts);

	let k = getBooks2;

	k = k.innerJoin('user_list_book', (join) =>
		join
			.onRef('user_list_book.book_id', '=', 'cte_book.id')
			.on('user_list_book.user_id', '=', listUser.id)
	);

	if (query) {
		k = k.where('cte_book.title', 'ilike', `%${query}%`);
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
