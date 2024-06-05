import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { DeduplicateJoinsPlugin } from 'kysely';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q');

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	let k = dbBooks.getBooks();
	k = k.where('cte_book.hidden', '=', false);
	const useQuery = true;
	if (query) {
		k = k.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb(
				'cte_book.id',
				'in',
				(eb) =>
					eb
						.selectFrom('book')
						.$if(useQuery, (qb) =>
							qb
								.innerJoin('book_title', (join) => join.onRef('book_title.book_id', '=', 'book.id'))
								.where((eb2) =>
									eb2.or([
										eb2('book_title.title', 'ilike', `%${query}%`),
										eb2('book_title.romaji', 'ilike', `%${query}%`),
									]),
								),
						)
						.select('book.id'),
				// Example of books with en releases
				// .$if(useQuery, (qb) =>
				// 	qb
				// 		.innerJoin('release_book', (join) =>
				// 			join.onRef('release_book.book_id', '=', 'book.id'),
				// 		)
				// 		.innerJoin('release', (join) =>
				// 			join.onRef('release.id', '=', 'release_book.release_id'),
				// 		)
				// 		.where((eb2) => eb2.or([eb2('release.lang', '=', 'en')])),
				// )
			),
		);
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(k, {
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
