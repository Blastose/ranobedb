import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userBookSchema } from '$lib/zod/schemas2';
import { superValidate, message } from 'sveltekit-superforms/server';
import type { Message } from '$lib/zod/schemas2';

export const actions = {
	default: async ({ params, request, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(401);
		}
		const user = session.user;
		const readerId = user.readerId;

		const form = await superValidate<typeof userBookSchema, Message>(request, userBookSchema);
		if (!form.valid) {
			return message(form, { status: 'error', text: 'Invalid form' }, { status: 400 });
		}

		const type = form.data.type;
		const bookId = Number(params.id);
		const startDate = form.data.startDate || null;
		const finishDate = form.data.finishDate || null;
		const status = form.data.label;

		let successMessage = '';
		try {
			await db.transaction().execute(async (trx) => {
				if (type === 'add') {
					await trx
						.insertInto('reads')
						.values({
							book_id: bookId,
							reader_id: readerId,
							added_date: new Date(),
							start_date: startDate,
							finish_date: finishDate
						})
						.execute();
					await trx
						.insertInto('reader_labels')
						.values({
							book_id: bookId,
							reader_id: readerId,
							label_name: status
						})
						.execute();
					successMessage = 'Added!';
				} else if (type === 'update') {
					await trx
						.updateTable('reads')
						.set({
							start_date: startDate,
							finish_date: finishDate
						})
						.where('reader_id', '=', readerId)
						.where('book_id', '=', bookId)
						.execute();
					await trx
						.updateTable('reader_labels')
						.set({
							label_name: status
						})
						.where('reader_id', '=', readerId)
						.where('book_id', '=', bookId)
						.execute();
					successMessage = 'Updated!';
				} else if (type === 'remove') {
					await trx
						.deleteFrom('reads')
						.where('reader_id', '=', readerId)
						.where('book_id', '=', bookId)
						.execute();
					await trx
						.deleteFrom('reader_labels')
						.where('reader_id', '=', readerId)
						.where('book_id', '=', bookId)
						.execute();
					successMessage = 'Removed!';
				}
			});
		} catch (e) {
			console.log(e);
			return message(form, { status: 'error', text: 'An error has occurred' }, { status: 400 });
		}

		return message(form, { status: 'success', text: successMessage });
	}
} satisfies Actions;
