import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const {
		result: publishers,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		dbPublishers
			.getPublishers()
			.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name')),
		{
			limit: 40,
			page: currentPage,
		},
	);

	return {
		publishers,
		count,
		currentPage,
		totalPages,
	};
};
