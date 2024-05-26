import { getChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const publisherId = Number(id);
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(getChanges('publisher', publisherId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});
	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers.getPublisher(publisherId).executeTakeFirstOrThrow();
	if (!publisher) {
		error(404);
	}

	return { changes, publisher, count, currentPage, totalPages };
};
