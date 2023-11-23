import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getPeople } from '$lib/server/db/people/people.js';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const {
		result: people,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(getPeople.orderBy('person_alias.name'), {
		limit: 40,
		page: currentPage
	});

	return {
		people,
		count,
		currentPage,
		totalPages
	};
};
