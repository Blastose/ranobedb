import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { userReviewSchema } from '$lib/server/zod/schema.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const seriesId = Number(id);
	const user = locals.user;

	if (!user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}
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

	const reviewQuery = dbReviews.getSeriesReviews({ userId: user.id, seriesId }).executeTakeFirst();
	const userListSeriesQuery = user
		? db
				.selectFrom('user_list_series')
				.where('user_list_series.series_id', '=', seriesId)
				.where('user_list_series.user_id', '=', user.id)
				.select(['user_list_series.score', 'user_list_series.volumes_read'])
				.select((eb) =>
					jsonObjectFrom(
						eb
							.selectFrom('series_book as sb3')
							.innerJoin('book', 'book.id', 'sb3.book_id')
							.innerJoin('user_list_book_label', (join) =>
								join
									.onRef('user_list_book_label.book_id', '=', 'book.id')
									.on('user_list_book_label.label_id', '=', 2)
									.on('user_list_book_label.user_id', '=', user.id),
							)
							.where('book.hidden', '=', false)
							.whereRef('sb3.series_id', '=', 'user_list_series.series_id')
							.select(({ fn }) => [fn.countAll().as('count')]),
					).as('c_vols_read'),
				)
				.executeTakeFirst()
		: undefined;

	const [series, review, userListSeries] = await Promise.all([
		seriesQuery,
		reviewQuery,
		userListSeriesQuery,
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

	const userReviewForm = await superValidate(
		{
			review_text: review?.review_text,
			spoiler: review?.spoiler,
			type: review ? 'update' : 'add',
			score: review?.score ?? userListSeries?.score,
			volumes_read:
				userListSeries?.volumes_read ?? (Number(userListSeries?.c_vols_read?.count) || undefined),
		},
		zod4(userReviewSchema),
		{
			errors: false,
		},
	);
	return { series, userReviewForm, reviews: review };
};

export const actions = {
	default: async (event) => {
		const { request, locals, params, cookies } = event;
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod4(userReviewSchema));

		let message;
		if (!(form.data.type === 'delete')) {
			if (!form.valid) {
				return fail(400, { form });
			}

			if (form.data.type === 'add') {
				message = 'Successfully added a review!';
			} else {
				message = 'Successfully edited your review!';
			}
			await db
				.insertInto('user_series_review')
				.values({
					series_id: id,
					last_updated: new Date(),
					review_text: form.data.review_text,
					spoiler: form.data.spoiler,
					user_id: locals.user.id,
					volumes_read: form.data.volumes_read,
					score: form.data.score,
				})
				.onConflict((oc) =>
					oc.columns(['series_id', 'user_id']).doUpdateSet({
						review_text: form.data.review_text,
						spoiler: form.data.spoiler,
						score: form.data.score,
						volumes_read: form.data.volumes_read,
						last_updated: new Date(),
					}),
				)
				.execute();
		} else {
			message = 'Deleted review!';
			await db
				.deleteFrom('user_series_review')
				.where('user_series_review.user_id', '=', locals.user.id)
				.where('user_series_review.series_id', '=', id)
				.execute();
		}

		return flashRedirect(
			303,
			`/series/${id}/reviews`,
			{ type: 'success', message: message },
			cookies,
		);
	},
};
