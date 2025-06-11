import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { DBUsers } from '$lib/server/db/user/user';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const listUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);
	if (!listUser) {
		error(404);
	}

	const dbReviews = DBReviews.fromDB(db, user);
	const reviewsQuery = dbReviews
		.getSeriesReviewsWithSeriesObj({ userId: listUser.id })
		.orderBy('user_series_review.created', 'desc');

	const [reviews] = await Promise.all([
		paginationBuilderExecuteWithCount(reviewsQuery, {
			limit: 100,
			page: currentPage,
		}),
	]);

	return {
		reviews: reviews.result,
		count: reviews.count,
		currentPage: currentPage,
		totalPages: reviews.totalPages,
		listUser,
		isMyList: user?.id_numeric === userIdNumeric,
	};
};
