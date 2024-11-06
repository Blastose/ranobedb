import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userListBookBatchSchema } from '$lib/server/zod/schema';
import { db } from '$lib/server/db/db';
import { defaultUserListLabelsMap } from '$lib/db/dbConsts';
import type { UserListBookLabel } from '$lib/server/db/dbTypes';

export const actions = {
	default: async ({ params, request, locals }) => {
		const seriesId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod(userListBookBatchSchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		const messageText = 'Successfully batch edited books!';

		try {
			await db.transaction().execute(async (trx) => {
				if (form.data.book_ids.length === 0) {
					return;
				}

				const book_ids = (
					await trx
						.selectFrom('series_book')
						.innerJoin('user_list_series', 'user_list_series.series_id', 'series_book.series_id')
						.where('user_list_series.user_id', '=', user.id)
						.where('series_book.series_id', '=', seriesId)
						.where('book_id', 'in', form.data.book_ids)
						.select('book_id')
						.execute()
				).map((v) => v.book_id);
				if (book_ids.length === 0) {
					return;
				}

				if (form.data.readingStatus === 'Remove') {
					await trx
						.deleteFrom('user_list_book_label')
						.where('book_id', 'in', form.data.book_ids)
						.where('user_id', '=', user.id)
						.execute();
					await trx
						.deleteFrom('user_list_book')
						.where('book_id', 'in', form.data.book_ids)
						.where('user_id', '=', user.id)
						.execute();
					await trx
						.deleteFrom('user_list_release')
						.where('user_id', '=', user.id)
						.where((eb) =>
							eb(
								'user_list_release.release_id',
								'in',
								eb
									.selectFrom('release')
									.innerJoin(
										'release_book',
										'release_book.release_id',
										'user_list_release.release_id',
									)
									.select('release.id')
									.where('book_id', 'in', form.data.book_ids),
							),
						)
						.execute();
				} else {
					const readingStatusId = defaultUserListLabelsMap.get(form.data.readingStatus) ?? 1;
					for (const book_id of book_ids) {
						await trx
							.insertInto('user_list_book')
							.values({
								book_id: book_id,
								last_updated: new Date(),
								notes: '',
								user_id: user.id,
							})
							.onConflict((oc) =>
								oc.columns(['book_id', 'user_id']).doUpdateSet({
									last_updated: new Date(),
								}),
							)
							.execute();
					}
					await trx
						.deleteFrom('user_list_book_label')
						.where('user_id', '=', user.id)
						.where('book_id', 'in', book_ids)
						.where('label_id', '<=', 10)
						.execute();
					const readingStatuses = book_ids.map((v) => ({
						book_id: v,
						label_id: readingStatusId,
						user_id: user.id,
					})) satisfies UserListBookLabel[];
					if (readingStatuses.length > 0) {
						await trx.insertInto('user_list_book_label').values(readingStatuses).execute();
					}
				}
			});
		} catch (e) {
			console.log(e);
			return message(
				form,
				{ type: 'error', text: 'An unknown error has occurred!' },
				{ status: 400 },
			);
		}

		return message(form, { type: 'success', text: messageText });
	},
} satisfies Actions;
