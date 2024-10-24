import { RanobeDB } from '$lib/server/db/db';
import type { InferResult, Kysely } from 'kysely';
import type { DB } from '$lib/server/db/dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { withBookTitleCte } from '../books/books';
import { withSeriesTitleCte } from '../series/series';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

export class DBReviews {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	hasBookReview(params: { bookId: number; userId: string }) {
		const { bookId, userId } = params;
		return this.getBookReviews({ bookId, userId }).clearSelect();
	}

	hasSeriesReview(params: { seriesId: number; userId: string }) {
		const { seriesId, userId } = params;
		return this.getSeriesReviews({ seriesId, userId }).clearSelect();
	}

	getBookReviews(params: { bookId?: number; userId?: string; reviewId?: number }) {
		const { bookId, userId, reviewId } = params;
		let query = this.ranobeDB.db
			.with('cte_book', () => withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('user_book_review')
			.innerJoin('auth_user', 'auth_user.id', 'user_book_review.user_id')
			.select([
				'user_book_review.id as review_id',
				'user_book_review.last_updated',
				'user_book_review.created',
				'user_book_review.spoiler',
				'user_book_review.review_text',
				'user_book_review.score',
				'auth_user.username',
				'auth_user.id_numeric as user_id',
				'auth_user.id as user_id_string',
				'user_book_review.book_id as item_id',
			])
			.select((eb) => eb.val<number | null>(null).as('volumes_read'));

		if (userId) {
			query = query.where('user_book_review.user_id', '=', userId);
		}
		if (bookId) {
			query = query.where('user_book_review.book_id', '=', bookId);
		}
		if (reviewId) {
			query = query.where('user_book_review.id', '=', reviewId);
		}

		return query;
	}

	getSeriesReviews(params: { seriesId?: number; userId?: string; reviewId?: number }) {
		const { seriesId, userId, reviewId } = params;
		let query = this.ranobeDB.db
			.with('cte_series', () => withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('user_series_review')
			.innerJoin('auth_user', 'auth_user.id', 'user_series_review.user_id')
			.select([
				'user_series_review.id as review_id',
				'user_series_review.last_updated',
				'user_series_review.created',
				'user_series_review.spoiler',
				'user_series_review.review_text',
				'user_series_review.score',
				'user_series_review.volumes_read',
				'auth_user.username',
				'auth_user.id_numeric as user_id',
				'auth_user.id as user_id_string',
				'user_series_review.series_id as item_id',
			]);

		if (userId) {
			query = query.where('user_series_review.user_id', '=', userId);
		}
		if (seriesId) {
			query = query.where('user_series_review.series_id', '=', seriesId);
		}
		if (reviewId) {
			query = query.where('user_series_review.id', '=', reviewId);
		}

		return query;
	}

	getBookReviewsWithBookObj(params: { seriesId?: number; userId?: string; reviewId?: number }) {
		const query = this.getBookReviews(params).select((eb) =>
			jsonObjectFrom(
				eb
					.selectFrom('cte_book')
					.select([
						'cte_book.lang',
						'cte_book.romaji',
						'cte_book.romaji_orig',
						'cte_book.title',
						'cte_book.title_orig',
						'cte_book.olang',
						'cte_book.locked',
						'cte_book.hidden',
						'cte_book.id',
					])
					.select((eb) => [
						jsonObjectFrom(
							eb
								.selectFrom('image')
								.selectAll('image')
								.whereRef('image.id', '=', 'cte_book.image_id')
								.limit(1),
						).as('image'),
					])
					.whereRef('cte_book.id', '=', 'user_book_review.book_id'),
			).as('obj'),
		);
		return query;
	}

	getSeriesReviewsWithSeriesObj(params: { seriesId?: number; userId?: string; reviewId?: number }) {
		const query = this.getSeriesReviews(params).select((eb) =>
			jsonObjectFrom(
				eb
					.selectFrom('cte_series')
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
					.select((eb) => [
						jsonObjectFrom(
							eb
								.selectFrom('image')
								.selectAll('image')
								.innerJoin('book', 'book.image_id', 'image.id')
								.innerJoin('series_book', 'series_book.book_id', 'book.id')
								.whereRef('series_book.series_id', '=', 'cte_series.id')
								.where('book.hidden', '=', false)
								.limit(1),
						).as('image'),
					])
					.whereRef('cte_series.id', '=', 'user_series_review.series_id'),
			).as('obj'),
		);
		return query;
	}
}

export type BookReview = InferResult<ReturnType<DBReviews['getBookReviews']>>[number];
export type SeriesReview = InferResult<ReturnType<DBReviews['getSeriesReviews']>>[number];
export type BookReviewWithBookObj = InferResult<
	ReturnType<DBReviews['getBookReviewsWithBookObj']>
>[number];
export type SeriesReviewWithSeriesObj = InferResult<
	ReturnType<DBReviews['getSeriesReviewsWithSeriesObj']>
>[number];
