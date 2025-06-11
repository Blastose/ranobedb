import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBBooks } from '$lib/server/db/books/books.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { pageSchema, userReviewSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	const dbBooks = DBBooks.fromDB(db, user);
	const dbReviews = DBReviews.fromDB(db, user);
	const bookQuery = dbBooks
		.getBook(bookId)
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

	const reviewsQuery = dbReviews.getBookReviews({ bookId });
	const userHasReviewQuery = locals.user
		? dbReviews.hasBookReview({ userId: locals.user.id, bookId }).executeTakeFirst()
		: undefined;

	const [book, reviews, userHasReview] = await Promise.all([
		bookQuery,
		paginationBuilderExecuteWithCount(reviewsQuery, {
			limit: 100,
			page: currentPage,
		}),
		userHasReviewQuery,
	]);

	if (!book) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: book,
		itemId: bookId,
		itemName: 'book',
		title: getTitleDisplay({ obj: book, prefs: getDisplayPrefsUser(user).title_prefs }),
		user,
	});

	const userReviewForm = await superValidate(zod4(userReviewSchema));
	return {
		book,
		userReviewForm,
		reviews: reviews.result,
		userHasReview: Boolean(userHasReview),
		count: reviews.count,
		currentPage: currentPage,
		totalPages: reviews.totalPages,
	};
};
