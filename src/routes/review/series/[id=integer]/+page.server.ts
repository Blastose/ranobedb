import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const reviewId = Number(id);
	const user = locals.user;

	const review = await DBReviews.fromDB(db)
		.getSeriesReviews({
			reviewId,
		})
		.executeTakeFirst();

	if (!review) {
		error(404);
	}

	const dbSeries = DBSeries.fromDB(db, user);
	const seriesQuery = dbSeries
		.getSeriesOne(review.item_id)
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
					.orderBy('sort_order asc'),
			).as('books'),
		)
		.executeTakeFirst();
	const series = await seriesQuery;

	if (!series) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: series,
		itemId: reviewId,
		itemName: 'series',
		title: getTitleDisplay({ obj: series, prefs: getDisplayPrefsUser(user).title_prefs }),
		user,
	});

	const isOwnReview = review.user_id_string === locals.user?.id;
	return { series, review, isOwnReview };
};
