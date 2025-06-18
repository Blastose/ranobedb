import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;

	const query = DBReviews.fromDB(db).getBooksAndSeriesReviewsWithObj();

	const {
		result: reviews,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(
		query,
		{
			limit: 24,
			page: currentPage,
		},
		db
			.with('revs', (cte) =>
				cte
					.selectFrom('user_book_review')
					.select('id')
					.unionAll(cte.selectFrom('user_series_review').select('id')),
			)
			.selectFrom('revs')
			.select((eb) => eb.fn.countAll<string>().as('count')),
		true,
	);

	return { reviews, count, currentPage, totalPages };
};
