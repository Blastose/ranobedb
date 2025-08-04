import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBBooks } from '$lib/server/db/books/books.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBReviews } from '$lib/server/db/reviews/reviews.js';
import { userReviewSchema } from '$lib/server/zod/schema.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const bookId = Number(id);
	const user = locals.user;

	if (!user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

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

	const reviewQuery = dbReviews.getBookReviews({ userId: user.id, bookId }).executeTakeFirst();
	const userListBookQuery = user
		? db
				.selectFrom('user_list_book')
				.where('user_list_book.book_id', '=', bookId)
				.where('user_list_book.user_id', '=', user.id)
				.select((eb) => eb(eb.cast<string>('score', 'decimal'), '/', '10').as('score'))
				.executeTakeFirst()
		: undefined;

	const [book, review, userListBook] = await Promise.all([
		bookQuery,
		reviewQuery,
		userListBookQuery,
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

	const reviewScore = Number(review?.score ?? userListBook?.score);
	const userReviewForm = await superValidate(
		{
			review_text: review?.review_text,
			spoiler: review?.spoiler,
			type: review ? 'update' : 'add',
			// Note: Even though the zod schema uses coerce, it doesn't correctly convert the string score to a number for unknown reasons
			score: reviewScore !== 0 ? reviewScore : null,
		},
		zod4(userReviewSchema),
		{
			errors: false,
		},
	);
	return { book, userReviewForm, reviews: review };
};

export const actions = {
	default: async (event) => {
		const { request, locals, params, cookies } = event;
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod4(userReviewSchema));

		let message;
		if (!(form.data.type === 'delete')) {
			if (!form.valid) {
				return fail(400, { form });
			}

			if (form.data.type === 'add') {
				message = 'Successfully added a review!';
			} else {
				message = 'Successfully edited your review!';
			}
			await db
				.insertInto('user_book_review')
				.values({
					book_id: id,
					last_updated: new Date(),
					review_text: form.data.review_text,
					spoiler: form.data.spoiler,
					user_id: locals.user.id,
					score: form.data.score ? form.data.score * 10 : form.data.score,
				})
				.onConflict((oc) =>
					oc.columns(['book_id', 'user_id']).doUpdateSet({
						review_text: form.data.review_text,
						spoiler: form.data.spoiler,
						score: form.data.score ? form.data.score * 10 : form.data.score,
						last_updated: new Date(),
					}),
				)
				.execute();
		} else {
			message = 'Deleted review!';
			await db
				.deleteFrom('user_book_review')
				.where('user_book_review.user_id', '=', locals.user.id)
				.where('user_book_review.book_id', '=', id)
				.execute();
		}

		return flashRedirect(
			303,
			`/book/${id}/reviews`,
			{ type: 'success', message: message },
			cookies,
		);
	},
};
