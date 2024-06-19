import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	let query = dbBooks.getBooks();
	query = query.orderBy((eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'));
	query = query.where('cte_book.hidden', '=', false);
	const useQuery = true;
	if (q) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
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
										eb2('book_title.title', 'ilike', `%${q}%`),
										eb2('book_title.romaji', 'ilike', `%${q}%`),
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
