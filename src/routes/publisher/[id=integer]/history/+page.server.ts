import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const publisherId = Number(id);
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		new DBChanges(db).getChanges('publisher', publisherId),
		{
			limit: historyItemsPerPage,
			page: currentPage,
		},
	);
	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers
		.getPublisher(publisherId)
		.clearSelect()
		.select(['publisher.name', 'publisher.romaji'])
		.executeTakeFirstOrThrow();
	if (!publisher) {
		error(404);
	}

	return { changes, publisher, count, currentPage, totalPages };
};
