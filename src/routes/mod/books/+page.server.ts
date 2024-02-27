import { error, redirect } from '@sveltejs/kit';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { getBooks2 } from '$lib/server/db/books/books.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';

export const load = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	if (!hasVisibilityPerms(locals.user)) {
		error(401);
	}

	const query = getBooks2
		.select(['cte_book.hidden', 'cte_book.locked'])
		.groupBy(['cte_book.hidden', 'cte_book.locked'])
		.where((eb) => eb.or([eb('cte_book.locked', '=', true), eb('cte_book.hidden', '=', true)]));

	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: books,
		count,
		totalPages
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage
	});

	return {
		books,
		count,
		currentPage,
		totalPages
	};
};
