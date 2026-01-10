import { DBChanges } from '$lib/server/db/change/change';
import { db } from '$lib/server/db/db';
import { DBReleases } from '$lib/server/db/releases/releases';
import { historyFiltersSchema } from '$lib/server/zod/schema';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { DBSeries } from '$lib/server/db/series/series';

dayjs.extend(customParseFormat);

function getNow() {
	const now = dayjs().format('YYYYMMDD');
	return Number(now);
}

export const load = async ({ locals }) => {
	const now = getNow();

	const form = await superValidate(zod4(historyFiltersSchema));
	const dbReleases = DBReleases.fromDB(db, locals.user);
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

	const recentlyReleasedPromise = dbReleases
		.getReleasesWithImage()
		.where('release.release_date', '<', now)
		.where('release.hidden', '=', false)
		.orderBy('release.release_date', 'desc')
		.orderBy('release.id')
		.limit(10)
		.execute();
	const upcomingReleasesPromise = dbReleases
		.getReleasesWithImage()
		.where('release.release_date', '>=', now)
		.where('release.hidden', '=', false)
		.orderBy('release.release_date', 'asc')
		.orderBy('release.id')
		.limit(10)
		.execute();
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
	// 			'https://bookwalker.jp/de1de3024a-3776-4e42-b711-fb0a0f79f64e/',
	// 			'https://bookwalker.jp/de0036bca2-9601-433a-9e22-4a28c3b602ae/',
	// 			'https://bookwalker.jp/de340455dc-6170-4456-a28b-2931edab194b/',
	// 			'https://bookwalker.jp/dee5bad63a-11e7-4b4d-9107-d54ee58d6c9a/',
	// 			'https://bookwalker.jp/de1eca9eb8-9463-46bc-ad88-53d6428e3210/',
	// 			'https://bookwalker.jp/de142ea972-bfbd-4aa1-81a4-a49c728d0663/',
	// 			'https://bookwalker.jp/de0d1134d6-e07d-4b9f-b8be-88352fa31b51/',
	// 			'https://bookwalker.jp/de15ea696e-e1ac-41f1-9d51-907cb7e1c934/',
	// 			'https://bookwalker.jp/deb9ccb7cb-969a-437d-ba73-71e9314fd230/',
	// 			'https://bookwalker.jp/debefd8637-8083-437e-8bf9-d8c24ab2c148/',
	// 			'https://bookwalker.jp/dea94b80b2-815f-4d3a-b2c9-fa3493cc1cd5/',
	// 			'https://bookwalker.jp/de6677f240-0147-4ea9-af6b-f12caf8730b7/',
	// 			'https://bookwalker.jp/de90618924-4b0c-4682-abc5-d43bf0407f16/',
	// 			'https://bookwalker.jp/deb918c106-849c-4306-96b7-137af86fdb1a/',
	// 			'https://bookwalker.jp/de8d046323-344f-49c1-9a7e-8cd6c384a290/',
	// 			'https://bookwalker.jp/de0cdb39c8-5d71-4263-9b5a-b6bf7f12d16c/',
	// 			'https://bookwalker.jp/de83df2f64-c3f4-4fe2-8143-44aeefd2a6e8/',
	// 			'https://bookwalker.jp/dee557b64b-d257-4c76-9b07-251db11b2b76/',
	// 			'https://bookwalker.jp/debce93b06-5a5d-45f2-bbfc-aab734183987/',
	// 			'https://bookwalker.jp/decc1394b1-2a5d-4106-948d-c2af68031fcb/',
	// 			'https://bookwalker.jp/de24913fc4-77c4-4b63-8ca7-d3a3d8125a14/',
	// 			'https://bookwalker.jp/dedd54bf6e-5864-48ba-b151-e0ad06906cf1/',
	// 			'https://bookwalker.jp/deec8998d6-2282-4faf-943c-a5b5729b2670/',
	// 			'https://bookwalker.jp/decd10e590-f3b1-4b08-9d10-fd9ec8cca3e3/',
	// 			'https://bookwalker.jp/de92a1f835-4f30-4e80-81cf-5cbebc5f92cc/',
	// 			'https://bookwalker.jp/ded201c056-f7a4-431b-9d60-158a4f651890/',
	// 			'https://bookwalker.jp/dec355d3b9-c795-4997-97f5-a1332e183fdd/',
	// 			'https://bookwalker.jp/de891c511e-e70a-4bab-84d5-fa1c78a13b38/',
	// 			'https://bookwalker.jp/dec0166db0-93f9-4222-9b69-1f3d62cee819/',
	// 			'https://bookwalker.jp/de3bf6fd80-f292-43ab-96ad-277a07cd7bc7/',
	// 			'https://bookwalker.jp/dec6a4c9ce-f222-4bf0-91a1-a3b1326ed4f3/',
	// 			'https://bookwalker.jp/def6e385b7-ecb0-4944-b207-afbb37598150/',
	// 			'https://bookwalker.jp/defe28798a-000a-4da3-a287-0c33e1c8bd75/',
	// 			'https://bookwalker.jp/def63c4bc2-e058-4008-9645-25744d0af6d5/',
	// 			'https://bookwalker.jp/ded838769f-e606-49c2-b3dd-4394f90d6bd1/',
	// 			'https://bookwalker.jp/dec36bf3d6-be56-42b7-9b09-a81d1da6ff31/',
	// 			'https://bookwalker.jp/decb511c92-6816-4885-8796-a56d3a4c702a/',
	// 			'https://bookwalker.jp/de7aaed06a-a82a-4918-9e86-afd7080bf518/',
	// 			'https://bookwalker.jp/dee5d247ec-5360-4114-94cf-f83b29cef168/',
	// 			'https://bookwalker.jp/debae3622c-a290-4326-a4ef-a98c45c98921/',
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
				30, 553, 3580, 3979, 4197, 5140, 6115, 8218, 8372, 9934, 9952, 11138, 11423, 12489, 12616,
				12647, 12955, 13184, 13340, 14193, 14522, 15100, 15694, 15745, 16086, 16428, 17132, 17231,
				18065, 18290, 20418,
			],
		)
		.limit(16)
		.execute();

	const [
		recentlyReleased,
		upcomingReleases,
		recentChanges,
		bookReviews,
		seriesReviews,
		mostPopularSeries,
		seasonalAnime,
	] = await Promise.all([
		recentlyReleasedPromise,
		upcomingReleasesPromise,
		recentChangesPromise,
		bookReviewsPromise,
		seriesReviewsPromise,
		mostPopularSeriesPromise,
		seasonalAnimePromise,
	]);

	return {
		recentlyReleased,
		upcomingReleases,
		recentChanges,
		bookReviews,
		seriesReviews,
		mostPopularSeries,
		seasonalAnime,
		homeDisplaySettings,
	};
};
