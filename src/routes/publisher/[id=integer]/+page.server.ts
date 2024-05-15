import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const id = Number(params.id);

	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers.getPublisher(id).executeTakeFirst();
	const booksQuery = dbPublishers.getBooksBelongingToPublisher(id);

	if (!publisher) {
		error(404);
	}
	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(booksQuery, {
		limit: 24,
		page: currentPage,
	});

	return { publisher, books, count, currentPage, totalPages };
};
