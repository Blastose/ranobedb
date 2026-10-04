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
import { seasonalAnimeSeriesIds, seasonalAnimeSeason } from '$lib/server/db/series/seasonal-anime';
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

	// const urls = [
	// 	'https://bookwalker.jp/de15bc4ec2-c714-43db-883a-24438bc447bb/',
	// 	'https://bookwalker.jp/def3aca9d8-1683-476b-86bc-36ebc75ac103/',
	// 	'https://bookwalker.jp/de0cfffd3c-03f3-4ecd-bd30-8c9feec6bc67/',
	// 	'https://bookwalker.jp/debf8def73-f22d-441b-b266-57e9f8f2d689/',
	// 	'https://bookwalker.jp/de6310b4d4-2e4d-4648-b9dd-5d4360734299/',
	// 	'https://bookwalker.jp/deed251b9c-a82d-49db-b4d6-86bfc03dbddd/',
	// 	'https://bookwalker.jp/de7bf31494-47d2-45f1-bba2-0b714c03c21b/',
	// 	'https://bookwalker.jp/de1cf40bc6-4a0c-4cae-9342-e09d9875c715/',
	// 	'https://bookwalker.jp/de05e0b661-f836-42b9-a0ab-a274fa27e68d/',
	// 	'https://bookwalker.jp/dea7c0084c-1b15-47da-bc5b-8849dcb9fc1d/',
	// 	'https://bookwalker.jp/ded363e7d2-dcfd-437d-bed6-725dfc37c34b/',
	// 	'https://bookwalker.jp/de6746f912-061d-4f9e-80d0-81ea06ef2b55/',
	// 	'https://bookwalker.jp/de897a34e1-8440-44f4-bb4e-a13ef9167df2/',
	// 	'https://bookwalker.jp/de3a2d9526-dc26-461a-b071-b8787faf8698/',
	// 	'https://bookwalker.jp/deb20c6580-97db-4fe4-bc21-0d45c1c9ce9d/',
	// 	'https://bookwalker.jp/de7bbc05bd-99aa-4818-afb7-23ccf2c1df3b/',
	// 	'https://bookwalker.jp/de4b0fca28-9319-44a9-bcf5-813b9611a1ce/',
	// 	'https://bookwalker.jp/de1a082f1e-64c8-4d3b-8c20-5c49bf9cc2e7/',
	// 	'https://bookwalker.jp/debce93b06-5a5d-45f2-bbfc-aab734183987/',
	// 	'https://bookwalker.jp/de2a3e4762-34e2-47fd-8cfb-1ca27f2e0dea/',
	// 	'https://bookwalker.jp/dedd358530-f7ed-4752-9fe1-ea7232c5162c/',
	// 	'https://bookwalker.jp/de5face5e3-dadd-460c-88e7-66464ef1963d/',
	// 	'https://bookwalker.jp/de2b4d191d-e854-4c80-b01a-e5e486729ce2/',
	// 	'https://bookwalker.jp/de75f9d99d-7344-4646-a16c-54f0766288db/',
	// 	'https://bookwalker.jp/de6345882c-9a2f-418a-a3ab-ec2ae74d4ba3/',
	// 	'https://bookwalker.jp/de95feb1bf-be9d-4879-913d-79e2014892d3/',
	// 	'https://bookwalker.jp/deac1eee3d-c1c4-4580-a6cf-7a93e4dd9787/',
	// 	'https://bookwalker.jp/de7f0ee6e7-bede-4649-b8df-550e91e4b0c4/',
	// 	'https://bookwalker.jp/deec5792f9-dd7a-4972-8b84-224fd4029810/',
	// 	'https://bookwalker.jp/deca55eac8-3da1-4fb5-96c7-f693f5986d18/',
	// 	'https://bookwalker.jp/deb42e441f-7349-42bc-b43e-4d083b20725f/',
	// 	'https://bookwalker.jp/de9b82ed6b-69ed-40ea-947d-e8b011cbfd4c/',
	// 	'https://bookwalker.jp/de03eae531-ce38-4f31-90f5-670f66660868/',
	// 	'https://bookwalker.jp/de7534431f-6b37-441c-8e29-a2d84d4cb076/',
	// 	'https://bookwalker.jp/de44790331-5b86-454b-aa52-f4cbf5d2951d/',
	// 	'https://bookwalker.jp/de6f4af7a0-2906-48b5-9de2-9522667d944a/',
	// 	'https://bookwalker.jp/de2acc07cb-133f-4dbd-ba0c-f3df9da6cd51/',
	// 	'https://bookwalker.jp/de0a14070d-a398-42c8-b1bf-e9856b4926cd/',
	// ];

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
		.where('cte_series.id', 'in', seasonalAnimeSeriesIds)
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
		seasonalAnimeSeason,
		homeDisplaySettings,
		todayIso,
		yesterdayIso,
		upcomingReleasesFilters: upcomingReleasesFiltersParams.toString(),
		recentlyReleasedFilters: recentlyReleasedFiltersParams.toString(),
	};
};
