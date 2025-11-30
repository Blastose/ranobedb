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
	// 			'https://bookwalker.jp/de7e8bf962-530c-4c07-b176-bab41feec227/',
	// 			'https://bookwalker.jp/dee13bc2f9-37ea-4f4e-87dc-1ed558ea4e70/',
	// 			'https://bookwalker.jp/de7bc1cebe-26e6-4f3e-a599-b8e2830469a7/',
	// 			'https://bookwalker.jp/de821a05d6-60fb-49d5-bd7d-acc892cd4e37/',
	// 			'https://bookwalker.jp/def805dd43-931d-44e0-b375-bff8f553db62/',
	// 			'https://bookwalker.jp/de4449e121-04f2-4f08-86e4-8bfe3c1f4f8c/',
	// 			'https://bookwalker.jp/de1cf40bc6-4a0c-4cae-9342-e09d9875c715/',
	// 			'https://bookwalker.jp/deb64a5640-00b4-413f-bb41-48ef97070a0d/',
	// 			'https://bookwalker.jp/de6980edc5-c9b5-438a-9ff2-e25b3060fe20/',
	// 			'https://bookwalker.jp/de87f7709c-b023-4736-bf40-fe244d429455/',
	// 			'https://bookwalker.jp/de44871fab-d479-43fd-a094-8e4fb869d0fb/',
	// 			'https://bookwalker.jp/de1578fab1-58f9-4ce4-9739-c3a31b649dd1/',
	// 			'https://bookwalker.jp/de30fac261-7a87-4544-94b0-d0d3bea40a4a/',
	// 			'https://bookwalker.jp/defa4e3cf5-b2eb-439f-b397-cb162fdd1b2c/',
	// 			'https://bookwalker.jp/deed251b9c-a82d-49db-b4d6-86bfc03dbddd/',
	// 			'https://bookwalker.jp/de2677b62b-31fd-4736-a607-041b9afb9d11/',
	// 			'https://bookwalker.jp/de9cea619b-1234-47ac-8c6f-c7e1cb98ca11/',
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
				886, 4452, 5308, 6266, 6456, 7433, 7895, 8341, 8357, 8466, 9367, 9635, 11934, 12201, 12375,
				14746,
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
