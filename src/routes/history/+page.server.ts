import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { historyFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const form = await superValidate(url, zod(historyFiltersSchema));

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		new DBChanges(db).getChangesAll({ user: locals.user, filters: form.data }),
		{
			limit: historyItemsPerPage,
			page: currentPage,
		},
	);

	return { form, changes, count, currentPage, totalPages };
};
