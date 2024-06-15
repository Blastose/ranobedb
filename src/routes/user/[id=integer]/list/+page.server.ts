import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { getBooksRL, getUserLabelCounts } from '$lib/server/db/user/list';
import { DBUsers } from '$lib/server/db/user/user.js';
import { error } from '@sveltejs/kit';
import type { Expression, SqlBool } from 'kysely';

export const load = async ({ url, params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');
	const labels = url.searchParams.getAll('l').map((l) => Number(l) || 1);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const userLabelCounts = await getUserLabelCounts(listUser.id).execute();

	let k = getBooksRL(listUser.id, user).where('cte_book.hidden', '=', false);
	if (query) {
		k = k.where('cte_book.title', 'ilike', `%${query}%`);
	}

	if (labels.length > 0) {
		k = k.where((eb) => {
			const ors: Expression<SqlBool>[] = [];
			for (const l of labels) {
				ors.push(eb('user_list_book_label.label_id', '=', l));
			}

			return eb.or(ors);
		});
	} else {
		// Hack?
		// Without this, the query planner will loop over the entries of the user's user_list_label rows (normally 5 times for the default labels)
		// This fixes it so that it will not loop 5 times
		// Will need to do something else for custom labels
		k = k.where((eb) => {
			const ors: Expression<SqlBool>[] = [];
			for (const l of [1, 2, 3, 4, 5]) {
				ors.push(eb('user_list_book_label.label_id', '=', l));
			}

			return eb.or(ors);
		});
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(k, {
		limit: 24,
		page: currentPage,
	});

	return {
		books,
		count,
		currentPage,
		totalPages,
		userLabelCounts,
		isMyList: user?.id_numeric === userIdNumeric,
		listUser,
	};
};
