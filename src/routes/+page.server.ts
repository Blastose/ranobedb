import { DBChanges } from '$lib/server/db/change/change';
import { db } from '$lib/server/db/db';
import { getDefaultSavedFilter } from '$lib/server/db/user/saved-filters';
import { historyFiltersSchema, releaseFiltersSchema } from '$lib/server/zod/schema';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { DBSeries } from '$lib/server/db/series/series';
import { getReleases } from '$lib/server/db/releases/query.js';
import { z } from 'zod/v4';

dayjs.extend(customParseFormat);

export const load = async ({ locals }) => {
	const todayIso = dayjs().format('YYYY-MM-DD');
	const yesterdayIso = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

	const form = await superValidate(zod4(historyFiltersSchema));
	const dbChanges = new DBChanges(db);

	let homeDisplaySettings = null;
	if (locals.user) {
		homeDisplaySettings = (
			await db
				.selectFrom('auth_user')
				.select('auth_user.home_display_settings')
				.where('auth_user.id', '=', locals.user.id)
				.executeTakeFirstOrThrow()
		).home_display_settings;
	}

	const userListReleasesFilters = await getDefaultSavedFilter(locals.user?.id, 'release', false);

	const releasesForm = await superValidate(
		new URLSearchParams(userListReleasesFilters?.filters),
		zod4(releaseFiltersSchema),
	);
	const recentlyReleasedFiltersParams = new URLSearchParams(userListReleasesFilters?.filters);
	recentlyReleasedFiltersParams.set('sort', 'Release date desc');
	recentlyReleasedFiltersParams.set('maxDate', yesterdayIso);
	recentlyReleasedFiltersParams.set('minDate', '');
	const upcomingReleasesFiltersParams = new URLSearchParams(userListReleasesFilters?.filters);
	upcomingReleasesFiltersParams.set('sort', 'Release date asc');
	upcomingReleasesFiltersParams.set('minDate', todayIso);
	upcomingReleasesFiltersParams.set('maxDate', '');

	const recentlyReleasedForm = await superValidate(
		{ ...releasesForm.data, sort: 'Release date desc', maxDate: yesterdayIso, minDate: '' },
		zod4(releaseFiltersSchema),
	);
	const upcomingReleasesForm = await superValidate(
		{ ...releasesForm.data, sort: 'Release date asc', minDate: todayIso, maxDate: '' },
		zod4(releaseFiltersSchema),
	);

	const recentlyReleasedPromise = getReleases({
		currentPage: 1,
		db,
		q: '',
		listUser: locals.user,
		currentUser: locals.user,
		form: recentlyReleasedForm,
		limit: 10,
	});
	const upcomingReleasesPromise = getReleases({
		currentPage: 1,
		db,
		q: '',
		listUser: locals.user,
		currentUser: locals.user,
		form: upcomingReleasesForm,
		limit: 10,
	});

	const recentChangesPromise = dbChanges
		.getChangesAll({
			filters: form.data,
			user: locals.user,
		})
		.limit(10)
		.execute();
	const bookReviewsPromise = DBReviews.fromDB(db, locals.user)
		.getBookReviewsWithBookObj({ excludeReviewText: true })
		.limit(4)
		.orderBy('user_book_review.last_updated', 'desc')
		.execute();
	const seriesReviewsPromise = DBReviews.fromDB(db, locals.user)
		.getSeriesReviewsWithSeriesObj({ excludeReviewText: true })
		.limit(4)
		.orderBy('user_series_review.last_updated', 'desc')
		.execute();
	const mostPopularSeriesPromise = DBSeries.fromDB(db, locals.user)
		.getSeries()
		.clearOrderBy()
		.orderBy('c_popularity', 'desc')
		.limit(8)
		.execute();

	const maybelicensedSeriesIds = await db
		.selectFrom('kv_store')
		.where('kv_store.key', '=', 'newly_licensed_en')
		.select('kv_store.value')
		.executeTakeFirst();

	const seriesIdsSchema = z.array(z.object({ series_id: z.number() })).catch([{ series_id: 3343 }]);
	const licensedSeriesIds = seriesIdsSchema.parse(maybelicensedSeriesIds?.value);
	const licensedSeriesPromise = DBSeries.fromDB(db, locals.user)
		.getSeries()
		.where((eb) =>
			eb(
				'cte_series.id',
				'in',
				licensedSeriesIds.map((v) => v.series_id),
			),
		)
		.execute();
	const licensed_series_id_map = new Map(licensedSeriesIds.map((v, idx) => [v.series_id, idx]));

	// const airing_series = await db
	// 	.selectFrom('series')
	// 	.innerJoin('series_book', 'series_book.series_id', 'series.id')
	// 	.innerJoin('release_book', 'release_book.book_id', 'series_book.book_id')
	// 	.innerJoin('release', 'release.id', 'release_book.release_id')
	// 	.select('series.id')
	// 	.distinctOn('series.id')
	// 	.where((eb) => {
	// 		const ors = [];

	// 		const urls = [
	// 			'https://bookwalker.jp/de058e9af1-1c8c-457d-b3c4-24aa23f4b547/',
	// 			'https://bookwalker.jp/de785f27ee-f30b-4974-9b56-77eeb8a03764/',
	// 			'https://bookwalker.jp/debce93b06-5a5d-45f2-bbfc-aab734183987/',
	// 			'https://bookwalker.jp/def7c74be8-84dd-421f-ae74-4e50f1a1a82c/',
	// 			'https://bookwalker.jp/dec83aaa79-82bf-40d3-ae67-de7bfe7b8caf/',
	// 			'https://bookwalker.jp/ded5f68b90-7cf8-4eaa-ada7-011e4bd3646e/',
	// 			'https://bookwalker.jp/ded838769f-e606-49c2-b3dd-4394f90d6bd1/',
	// 			'https://bookwalker.jp/de1504f807-5bf1-4051-9843-ee38f5417408/',
	// 			'https://bookwalker.jp/de13fffb96-2017-43ce-b56f-4f84873b6647/',
	// 			'https://bookwalker.jp/deac45dc68-7002-4ba3-86ac-064790cc8d74/',
	// 			'https://bookwalker.jp/dea91367a7-d011-4c2b-bede-d8f553a1aaf3/',
	// 			'https://bookwalker.jp/de3a6b07f9-8713-44db-be6e-a48b14dcbb22/',
	// 			'https://bookwalker.jp/de26e0da9b-29d7-4805-bb5b-4f5eb3bd526e/',
	// 			'https://bookwalker.jp/de5d370113-f0f7-44de-93ab-c6e35adf3aa4/',
	// 			'https://bookwalker.jp/deea969fb4-f0d7-4e41-aa42-b7d8378abd6d/',
	// 			'https://bookwalker.jp/de6c07bc3c-fb12-481f-a0d3-1b7c92d869f5/',
	// 			'https://bookwalker.jp/dee5bad63a-11e7-4b4d-9107-d54ee58d6c9a/',
	// 			'https://bookwalker.jp/de6625e09b-6f9e-42f1-b9ce-1f991ff686d6/',
	// 			'https://bookwalker.jp/dec0dceeaa-53e9-4de9-9752-11cc111ade09/',
	// 			'https://bookwalker.jp/de75f1992a-3d73-4ba4-baa7-b2ba0c5468be/',
	// 			'https://bookwalker.jp/def745fec2-dcaf-416c-a884-5540baf37c22/',
	// 			'https://bookwalker.jp/de34706d06-563c-4c17-9216-9e643523e9c0/',
	// 			'https://bookwalker.jp/de9065072a-fd4f-49fb-911c-de3820991d2d/',
	// 			'https://bookwalker.jp/de10e2a402-5143-4dbf-a9aa-7c9de12ffa7a/',
	// 			'https://bookwalker.jp/de5ccb7d61-40ad-4106-92e9-667686e4a249/',
	// 			'https://bookwalker.jp/de3ea9f169-36cb-4c87-ba15-84fac54b64db/',
	// 			'https://bookwalker.jp/deae4b4b91-a521-463f-8524-525e6c4d4591/',
	// 			'https://bookwalker.jp/deb550f26c-c9d6-4c54-bcff-fb0f6688bc64/',
	// 			'https://bookwalker.jp/dee5d247ec-5360-4114-94cf-f83b29cef168/',
	// 			'https://bookwalker.jp/de08a94892-cfc1-4674-b09d-e8712deb0bab/',
	// 			'https://bookwalker.jp/de0f72c5a6-be75-4f69-8007-13124695bb9a/',
	// 			'https://bookwalker.jp/decb511c92-6816-4885-8796-a56d3a4c702a/',
	// 			'https://bookwalker.jp/deb91a2bf5-4a03-4959-954b-ecf098a6febc/',
	// 			'https://bookwalker.jp/de715596cb-22a2-4227-85ec-7f1aa3b00709/',
	// 			'https://bookwalker.jp/de39fde4d1-a825-4a5a-a52f-4944ba1dd17f/',
	// 			'https://bookwalker.jp/de066f5de7-dfde-44cb-9c4e-f66cff16f9d2/',
	// 			'https://bookwalker.jp/de5b3f4a93-9c1f-4d58-b207-19d7aaf03196/',
	// 			'https://bookwalker.jp/dea1bed22c-0a45-4b03-81fd-0c9ac8778fe4/',
	// 			'https://bookwalker.jp/defc02f156-ba66-478e-8f49-b2df9eb15774/',
	// 			'https://bookwalker.jp/de774228d1-1f9b-4907-a9e9-45c619602dad/',
	// 		];

	// 		for (const u of urls) {
	// 			ors.push(eb('release.bookwalker', 'ilike', `%${u}%`));
	// 		}

	// 		return eb.or(ors);
	// 	})
	// 	.execute();
	// console.log(airing_series.map((v) => v.id));
	// console.log(airing_series.length);
	const seasonalAnimePromise = DBSeries.fromDB(db, locals.user)
		.getSeries()
		.clearOrderBy()
		.orderBy('c_popularity', 'desc')
		.where(
			'cte_series.id',
			'in',
			[
				43, 859, 3148, 3336, 4595, 5568, 7406, 7590, 8107, 8622, 9035, 9116, 10014, 10148, 10676,
				10789, 11138, 11423, 11667, 12006, 12071, 12214, 12288, 13495, 13532, 13743, 14193, 15206,
				15290, 15694, 20827,
			],
		)
		.limit(20)
		.execute();

	const [
		recentlyReleased,
		upcomingReleases,
		recentChanges,
		bookReviews,
		seriesReviews,
		mostPopularSeries,
		seasonalAnime,
		licensedSeries,
	] = await Promise.all([
		recentlyReleasedPromise,
		upcomingReleasesPromise,
		recentChangesPromise,
		bookReviewsPromise,
		seriesReviewsPromise,
		mostPopularSeriesPromise,
		seasonalAnimePromise,
		licensedSeriesPromise,
	]);

	licensedSeries.sort((a, b) => {
		return (licensed_series_id_map.get(a.id) || 0) - (licensed_series_id_map.get(b.id) || 0);
	});

	return {
		recentlyReleased,
		upcomingReleases,
		recentChanges,
		bookReviews,
		seriesReviews,
		mostPopularSeries,
		licensedSeries,
		seasonalAnime,
		homeDisplaySettings,
		todayIso,
		yesterdayIso,
		upcomingReleasesFilters: upcomingReleasesFiltersParams.toString(),
		recentlyReleasedFilters: recentlyReleasedFiltersParams.toString(),
	};
};
