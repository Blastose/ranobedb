import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBBooks } from '$lib/server/db/books/books.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { error } from '@sveltejs/kit';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const reviewId = Number(id);
	const user = locals.user;

	const review = await db
		.selectFrom('user_book_review')
		.innerJoin('auth_user', 'auth_user.id', 'user_book_review.user_id')
		.where('user_book_review.id', '=', reviewId)
		.clearSelect()
		.select([
			'user_book_review.id as review_id',
			'user_book_review.last_updated',
			'user_book_review.created',
			'user_book_review.spoiler',
			'user_book_review.review_text',
			'auth_user.username',
			'auth_user.id_numeric as user_id_numeric',
			'auth_user.id as user_id',
			'user_book_review.book_id',
		])
		.executeTakeFirst();

	if (!review) {
		error(404);
	}

	const dbBooks = DBBooks.fromDB(db, user);
	const bookQuery = dbBooks
		.getBook(review.book_id)
		.clearSelect()
		.select([
			'cte_book.image_id',
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
		.executeTakeFirst();

	const book = await bookQuery;

	if (!book) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: book,
		itemId: reviewId,
		itemName: 'book',
		title: getTitleDisplay({ obj: book, prefs: getDisplayPrefsUser(user).title_prefs }),
		user,
	});

	const isOwnReview = review.user_id === locals.user?.id;
	return { book, review, isOwnReview };
};
