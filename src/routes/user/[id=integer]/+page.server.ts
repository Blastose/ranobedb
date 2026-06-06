import { getBooks } from '$lib/server/db/books/query.js';
import { getSeries } from '$lib/server/db/series/query.js';
import { bookFiltersSchema, seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { db } from '$lib/server/db/db.js';
import { getUserLabelCounts, getUserListCounts } from '$lib/server/db/user/list.js';
import { getUserSeriesListCounts } from '$lib/server/db/user/series-list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import type { User } from '$lib/server/lucia/lucia.js';
import { error } from '@sveltejs/kit';
import { sql } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

function getReadPerMonthQuery(listUser: { id: string }) {
	return db
		.selectFrom((eb) =>
			eb
				.fn('generate_series', [
					// TODO - Maybe use `MAKE_DATE()` instead of `DATE_TRUNC()`?
					sql`date_trunc('month', 'now'::date)::date - '12 month'::interval, date_trunc('month', 'now'::date)::date, interval '1 month'`,
				])
				.as('gs'),
		)
		.leftJoin('user_list_book', (join) =>
			join.on((eb) =>
				eb.and([
					eb(
						eb.fn('date_trunc', [eb.val('month'), 'user_list_book.finished']),
						'=',
						eb.cast<string>(eb.fn('date_trunc', [eb.val('month'), sql`gs`]), 'date'),
					),
					eb('user_list_book.user_id', '=', listUser.id),
				]),
			),
		)
		.select((eb) => [
			eb.cast<string>(eb.fn('date_trunc', [eb.val('month'), sql`gs`]), 'date').as('date'),
			eb
				.cast<number>(eb.fn.coalesce(eb.fn.count('user_list_book.book_id'), sql<number>`0`), 'int4')
				.as('count'),
		])
		.groupBy('date')
		.orderBy('date');
}

async function getUserProfileImage(listUser: { id: string }) {
	return db
		.selectFrom('auth_user')
		.leftJoin('profile_image', 'profile_image.id', 'auth_user.profile_image_id')
		.where('auth_user.id', '=', listUser.id)
		.select('profile_image.filename')
		.executeTakeFirstOrThrow();
}

async function getListAndReviewCounts(listUser: { id: string }) {
	const [
		labelCounts,
		seriesLabelCounts,
		readPerMonth,
		listCounts,
		bookReviewCountResult,
		seriesReviewCountResult,
		changeCountResult,
		finishedCountsResult,
	] = await Promise.all([
		getUserLabelCounts(listUser.id).execute(),
		getUserSeriesListCounts(db, listUser.id).execute(),
		getReadPerMonthQuery(listUser).execute(),
		getUserListCounts({ userId: listUser.id }),
		db
			.selectFrom('user_book_review')
			.where('user_book_review.user_id', '=', listUser.id)
			.select((eb) => eb.fn.count<string>('user_book_review.id').as('count'))
			.executeTakeFirstOrThrow(),
		db
			.selectFrom('user_series_review')
			.where('user_series_review.user_id', '=', listUser.id)
			.select((eb) => eb.fn.count<string>('user_series_review.id').as('count'))
			.executeTakeFirstOrThrow(),
		db
			.selectFrom('change')
			.where('change.user_id', '=', listUser.id)
			.select((eb) => eb.fn.count<string>('change.id').as('count'))
			.executeTakeFirstOrThrow(),
		db
			.selectFrom('user_list_book')
			.select((eb) => eb.fn.count<string>('user_list_book.book_id').as('count'))
			.where('user_list_book.user_id', '=', listUser.id)
			.where('user_list_book.finished', 'is not', null)
			.executeTakeFirstOrThrow(),
	]);
	return {
		labelCounts,
		seriesLabelCounts,
		readPerMonth,
		listCounts,
		bookReviewCount: Number(bookReviewCountResult.count),
		seriesReviewCount: Number(seriesReviewCountResult.count),
		changeCount: Number(changeCountResult.count),
		finishedCounts: Number(finishedCountsResult.count),
	};
}

async function getUserScoreData(listUser: { id: string }) {
	const [avgScoreBookResult, avgScoreSeriesResult, bookScoreDist, seriesScoreDist] =
		await Promise.all([
			db
				.selectFrom('user_list_book')
				.innerJoin('book', 'book.id', 'user_list_book.book_id')
				.where('user_list_book.user_id', '=', listUser.id)
				.where('user_list_book.score', 'is not', null)
				.where('book.hidden', '=', false)
				.select((eb) => eb.fn.avg<number>('user_list_book.score').as('avg_score'))
				.executeTakeFirstOrThrow(),
			db
				.selectFrom('user_list_series')
				.innerJoin('series', 'series.id', 'user_list_series.series_id')
				.where('user_list_series.user_id', '=', listUser.id)
				.where('user_list_series.score', 'is not', null)
				.where('series.hidden', '=', false)
				.select((eb) => eb.fn.avg<number>('user_list_series.score').as('avg_score'))
				.executeTakeFirstOrThrow(),
			db
				.selectFrom((eb) =>
					eb
						.fn('generate_series', [eb.lit(1), eb.lit(10)])
						.$castTo<{ gs: number }>()
						.as('gs'),
				)
				.leftJoin(
					(eb) =>
						eb
							.selectFrom((eb) =>
								eb
									.selectFrom('user_list_book')
									.select((eb) =>
										eb
											.fn('round', [eb(eb.cast('user_list_book.score', 'decimal'), '/', 10)])
											.as('score'),
									)
									.where('user_list_book.user_id', '=', listUser.id)
									.where('user_list_book.score', 'is not', null)
									.as('scores_rounded'),
							)
							.select('scores_rounded.score')
							.select((eb) => eb.fn.count('scores_rounded.score').as('cnt'))
							.groupBy('scores_rounded.score')
							.as('user_score'),
					(join) => join.onRef('user_score.score', '=', 'gs.gs'),
				)
				.orderBy('gs.gs', 'desc')
				.select('gs.gs')
				.select((eb) => eb.fn.coalesce('user_score.cnt', eb.val('0')).as('count'))
				.execute(),
			db
				.selectFrom((eb) =>
					eb
						.fn('generate_series', [eb.lit(1), eb.lit(10)])
						.$castTo<{ gs: number }>()
						.as('gs'),
				)
				.leftJoin(
					(eb) =>
						eb
							.selectFrom((eb) =>
								eb
									.selectFrom('user_list_series')
									.select((eb) =>
										eb
											.fn('round', [eb(eb.cast('user_list_series.score', 'decimal'), '/', 10)])
											.as('score'),
									)
									.where('user_list_series.user_id', '=', listUser.id)
									.where('user_list_series.score', 'is not', null)
									.as('scores_rounded'),
							)
							.select('scores_rounded.score')
							.select((eb) => eb.fn.count('scores_rounded.score').as('cnt'))
							.groupBy('scores_rounded.score')
							.as('user_score'),
					(join) => join.onRef('user_score.score', '=', 'gs.gs'),
				)
				.orderBy('gs.gs', 'desc')
				.select('gs.gs')
				.select((eb) => eb.fn.coalesce('user_score.cnt', eb.val('0')).as('count'))
				.execute(),
		]);

	return {
		avgScoreBook: Number(avgScoreBookResult.avg_score) / 10,
		avgScoreSeries: Number(avgScoreSeriesResult.avg_score) / 10,
		scoreDistributionBook: bookScoreDist,
		scoreDistributionSeries: seriesScoreDist,
	};
}

async function getRecentListUpdates(listUser: { id: string }, currentUser: User | null) {
	const bookForm = await superValidate(
		{
			list: 'In my list',
			sort: 'Last updated desc',
			limit: 5,
		},
		zod4(bookFiltersSchema),
	);
	const seriesForm = await superValidate(
		{
			list: 'In my list',
			sort: 'Last updated desc',
			limit: 5,
		},
		zod4(seriesFiltersSchema),
	);

	const [recentBooks, recentSeries] = await Promise.all([
		getBooks({
			currentPage: 1,
			limit: 5,
			q: null,
			db,
			listUser,
			currentUser,
			url: new URLSearchParams(),
			form: bookForm,
			isList: true,
		}),
		getSeries({
			currentPage: 1,
			limit: 5,
			q: null,
			db,
			listUser,
			currentUser,
			url: new URLSearchParams(),
			form: seriesForm,
			isList: true,
		}),
	]);

	return {
		recentBooks: recentBooks.books,
		recentSeries: recentSeries.series,
	};
}

export const load = async ({ params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const dbUsers = new DBUsers(db);
	const listUser = await dbUsers.getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const isCurrentUser = user?.id_numeric === listUser.id_numeric;

	const [profile_image, counts, scoreData, recentUpdates] = await Promise.all([
		getUserProfileImage(listUser),
		getListAndReviewCounts(listUser),
		getUserScoreData(listUser),
		getRecentListUpdates(listUser, user),
	]);

	return {
		listUser,
		profile_image,
		isCurrentUser,
		...counts,
		...scoreData,
		...recentUpdates,
	};
};
