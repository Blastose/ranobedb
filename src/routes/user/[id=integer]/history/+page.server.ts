import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { historyFiltersSchema, pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, params, locals }) => {
	const page = await superValidate(url, zod(pageSchema));

	const currentPage = page.data.page;
	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const routeUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);

	const form = await superValidate(url, zod(historyFiltersSchema));

	if (!form.valid) {
		error(400);
	}

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
