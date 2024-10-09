import { RanobeDB } from '$lib/server/db/db';
import type { Kysely } from 'kysely';
import type { DB } from '$lib/server/db/dbTypes';
import type { User } from 'lucia';

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

	getBookReviews(params: { bookId?: number; userId?: string }) {
		const { bookId, userId } = params;
		let query = this.ranobeDB.db
			.selectFrom('user_book_review')
			.innerJoin('auth_user', 'auth_user.id', 'user_book_review.user_id')
			.select([
				'user_book_review.id as review_id',
				'user_book_review.last_updated',
				'user_book_review.created',
				'user_book_review.spoiler',
				'user_book_review.review_text',
				'auth_user.username',
				'auth_user.id_numeric as user_id',
			]);

		if (userId) {
			query = query.where('user_book_review.user_id', '=', userId);
		}
		if (bookId) {
			query = query.where('user_book_review.book_id', '=', bookId);
		}

		return query;
	}

	getSeriesReviews(params: { seriesId?: number; userId?: string }) {
		const { seriesId, userId } = params;
		let query = this.ranobeDB.db
			.selectFrom('user_series_review')
			.innerJoin('auth_user', 'auth_user.id', 'user_series_review.user_id')
			.select([
				'user_series_review.id as review_id',
				'user_series_review.last_updated',
				'user_series_review.created',
				'user_series_review.spoiler',
				'user_series_review.review_text',
				'auth_user.username',
				'auth_user.id_numeric as user_id',
			]);

		if (userId) {
			query = query.where('user_series_review.user_id', '=', userId);
		}
		if (seriesId) {
			query = query.where('user_series_review.series_id', '=', seriesId);
		}

		return query;
	}
}
