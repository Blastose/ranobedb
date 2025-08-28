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
	const dbReleases = DBReleases.fromDB(db);
	const dbChanges = new DBChanges(db);

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
	const bookReviewsPromise = DBReviews.fromDB(db)
		.getBookReviewsWithBookObj({ excludeReviewText: true })
		.limit(4)
		.orderBy('user_book_review.last_updated', 'desc')
		.execute();
	const seriesReviewsPromise = DBReviews.fromDB(db)
		.getSeriesReviewsWithSeriesObj({ excludeReviewText: true })
		.limit(4)
		.orderBy('user_series_review.last_updated', 'desc')
		.execute();
	const mostPopularSeriesPromise = DBSeries.fromDB(db)
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
	// 			'https://bookwalker.jp/debf032b73-6ede-45da-a604-7792ba676600/',
	// 			'https://bookwalker.jp/de5cad13f2-a7bb-4211-8b7b-fe8d01bb9991/',
	// 			'https://bookwalker.jp/dea75e1f00-b31e-46c7-9bcd-123b2f7b7018/',
	// 			'https://bookwalker.jp/de05db36f3-b6d7-4632-b83a-11542dd98a28/',
	// 			'https://bookwalker.jp/dea6ff0695-e8bf-4cc8-b241-6a0ea32d4952/',
	// 			'https://bookwalker.jp/de6d30b6df-7e2e-4986-9a3d-461829f580e7/',
	// 			'https://bookwalker.jp/de3d391183-200b-40e3-8c63-a90fbb74bc6b/',
	// 			'https://bookwalker.jp/de6f768c21-7497-486a-8bfb-ac779604717c/',
	// 			'https://bookwalker.jp/def66802f4-8f16-44ae-9124-1686d794acc6/',
	// 			'https://bookwalker.jp/de2d7d1e65-89e3-4118-a509-d40c66a004ae/',
	// 			'https://bookwalker.jp/de1c76c224-bb0f-44db-90f5-6d244e7efa05/',
	// 			'https://bookwalker.jp/de2450bba4-bee3-4db6-95db-e668c4c76fdd/',
	// 			'https://bookwalker.jp/deb86bccd2-2d3a-4f56-babb-8fd3f52163ef/',
	// 			'https://bookwalker.jp/deb469b977-355b-447b-bf35-08acbf01bd95/',
	// 			'https://bookwalker.jp/de30fcbc31-edf3-4044-8445-25d443fa97cb/',
	// 			'https://bookwalker.jp/de7d57c88b-e6c0-471c-a317-165852c17779/',
	// 			'https://bookwalker.jp/de0ce8833f-4d38-4bea-a303-b6a708ab6a12/',
	// 			'https://bookwalker.jp/de615eff11-7fd1-4666-a336-4824b110bf76/',
	// 			'https://bookwalker.jp/de074d9622-d32c-455b-9c0a-176d0db8ede2/',
	// 			'https://bookwalker.jp/de2dde5186-204f-4eae-9b46-bdc12469db7b/',
	// 			'https://bookwalker.jp/de115fa317-f217-41d0-b487-a746a7be90ab/',
	// 			'https://bookwalker.jp/dec60300cf-07f5-424d-bdb4-504448b61bab/',
	// 			'https://bookwalker.jp/de4aff1097-a3ce-4ea6-ab9c-1c499d303d57/',
	// 		];

	// 		for (const u of urls) {
	// 			ors.push(eb('release.bookwalker', 'ilike', `%${u}%`));
	// 		}

	// 		return eb.or(ors);
	// 	})
	// 	.execute();
	// console.log(airing_series);
	const seasonalAnimePromise = DBSeries.fromDB(db)
		.getSeries()
		.clearOrderBy()
		.orderBy('c_popularity', 'desc')
		.where(
			'cte_series.id',
			'in',
			[
				1199, 2753, 2993, 3486, 8965, 9640, 10349, 10567, 10778, 11094, 11560, 11957, 12295, 15134,
				15835, 18477, 18785,
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
	};
};
