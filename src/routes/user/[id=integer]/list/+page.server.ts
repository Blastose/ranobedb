import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { getBooksRL, getUserLabelCounts } from '$lib/server/db/user/list';
import { DBUsers } from '$lib/server/db/user/user.js';
import { listLabelsSchema, pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;
	const listLabels = await superValidate(url, zod(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : [];

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const userLabelCounts = await getUserLabelCounts(listUser.id).execute();

	let query = getBooksRL(listUser.id, user).where('cte_book.hidden', '=', false);
	if (q) {
		query = query.where('cte_book.title', 'ilike', `%${q}%`);
	}

	if (labels.length > 0) {
		query = query.where((eb) => {
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
		query = query.where((eb) => {
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
	} = await paginationBuilderExecuteWithCount(query, {
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
		labels,
	};
};
