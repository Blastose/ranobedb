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

	const [
		recentlyReleased,
		upcomingReleases,
		recentChanges,
		bookReviews,
		seriesReviews,
		mostPopularSeries,
	] = await Promise.all([
		recentlyReleasedPromise,
		upcomingReleasesPromise,
		recentChangesPromise,
		bookReviewsPromise,
		seriesReviewsPromise,
		mostPopularSeriesPromise,
	]);

	return {
		recentlyReleased,
		upcomingReleases,
		recentChanges,
		bookReviews,
		seriesReviews,
		mostPopularSeries,
	};
};
