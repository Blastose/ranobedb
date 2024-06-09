import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const q = url.searchParams.get('q');
	const dbPublishers = DBPublishers.fromDB(db, locals.user);

	let query = dbPublishers
		.getPublishers()
		.where('publisher.hidden', '=', false)
		.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name'));

	if (q) {
		query = query.where((eb) =>
			eb.or([eb('publisher.romaji', 'ilike', `%${q}%`), eb('publisher.name', 'ilike', `%${q}%`)]),
		);
	}

	const {
		result: publishers,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 40,
		page: currentPage,
	});

	return {
		publishers,
		count,
		currentPage,
		totalPages,
	};
};
