import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { historyFiltersSchema, pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;

	const form = await superValidate(url, zod(historyFiltersSchema));

	if (!form.valid) {
		error(400);
	}

	const changesQuery = new DBChanges(db).getChangesAll({ user: locals.user, filters: form.data });

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		changesQuery,
		{
			limit: historyItemsPerPage,
			page: currentPage,
		},
		changesQuery
			.clearSelect()
			.clearOrderBy()
			.select((eb) => eb.fn.count<string>('change.id').as('count')),
		true,
	);

	return { form, changes, count, currentPage, totalPages };
};
