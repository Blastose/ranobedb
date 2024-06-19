import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { historyFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, params, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const routeUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);

	const form = await superValidate(url, zod(historyFiltersSchema));

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		new DBChanges(db)
			.getChangesAll({ user: locals.user, filters: form.data })
			.where('change.user_id', '=', routeUser.id),
		{
			limit: historyItemsPerPage,
			page: currentPage,
		},
	);

	return { routeUser, form, changes, count, currentPage, totalPages };
};
