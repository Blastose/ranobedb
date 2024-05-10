import { error, redirect } from '@sveltejs/kit';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { DBBooks } from '$lib/server/db/books/books.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { db } from '$lib/server/db/db.js';

export const load = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	if (!hasVisibilityPerms(locals.user)) {
		error(403);
	}

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	const query = dbBooks
		.getBooks()
		.select(['cte_book.hidden', 'cte_book.locked'])
		.where((eb) => eb.or([eb('cte_book.locked', '=', true), eb('cte_book.hidden', '=', true)]));

	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		books,
		count,
		currentPage,
		totalPages,
	};
};
