import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema, userReviewSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const id = params.id;
	const seriesId = Number(id);
	const user = locals.user;

	const dbSeries = DBSeries.fromDB(db, user);
	const dbReviews = DBReviews.fromDB(db, user);
	const seriesQuery = dbSeries
		.getSeriesOne(seriesId)
		.clearSelect()
		.select([
			'cte_series.lang',
			'cte_series.romaji',
			'cte_series.romaji_orig',
			'cte_series.title',
			'cte_series.title_orig',
			'cte_series.olang',
			'cte_series.locked',
			'cte_series.hidden',
			'cte_series.id',
		])
		.select((eb) =>
			jsonObjectFrom(
				eb
					.selectFrom('cte_book')
					.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
					.select((eb) =>
						jsonObjectFrom(
							eb
								.selectFrom('image')
								.whereRef('image.id', '=', 'cte_book.image_id')
								.selectAll('image')
								.limit(1),
						).as('image'),
					)
					.where('cte_book.hidden', '=', false)
					.whereRef('series_book.series_id', '=', 'cte_series.id')
					.limit(1)
					.orderBy('sort_order', 'asc'),
			).as('books'),
		)
		.executeTakeFirst();

	const reviewsQuery = dbReviews.getSeriesReviews({ seriesId });

	const userHasReviewQuery = locals.user
		? dbReviews.hasSeriesReview({ userId: locals.user.id, seriesId }).executeTakeFirst()
		: undefined;

	const [series, reviews, userHasReview] = await Promise.all([
		seriesQuery,
		paginationBuilderExecuteWithCount(reviewsQuery, {
			limit: 100,
			page: currentPage,
		}),
		userHasReviewQuery,
	]);

	if (!series) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: series,
		itemId: seriesId,
		itemName: 'book',
		title: getTitleDisplay({ obj: series, prefs: getDisplayPrefsUser(user).title_prefs }),
		user,
	});

	const userReviewForm = await superValidate(zod4(userReviewSchema));
	return {
		series,
		userReviewForm,
		reviews: reviews.result,
		userHasReview: Boolean(userHasReview),
		count: reviews.count,
		currentPage: currentPage,
		totalPages: reviews.totalPages,
	};
};
