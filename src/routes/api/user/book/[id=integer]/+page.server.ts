import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/lucia';

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
		const session = await locals.validate();
		if (!session) {
			return fail(401);
		}

		const reader = await db
			.selectFrom('user')
			.select('reader_id')
			.where('id', '=', session.userId)
			.executeTakeFirst();
		if (!reader) {
			return fail(401);
		}

		const readerId = reader.reader_id;

		const form = await request.formData();
		const type = form.get('type');
		const bookId = Number(params.id);
		const startDate = String(form.get('startDate')) || null;
		const finishDate = String(form.get('finishDate')) || null;
		const status = String(form.get('label'));

		try {
			if (type === 'add') {
				await db
					.insertInto('reads')
					.values({
						book_id: bookId,
						reader_id: readerId,
						added_date: new Date(),
						start_date: startDate,
						finish_date: finishDate
					})
					.execute();
				await db
					.insertInto('reader_labels')
					.values({
						book_id: bookId,
						reader_id: readerId,
						label_name: status
					})
					.execute();
				return { success: true, message: 'Added!' };
			} else if (type === 'update') {
				await db
					.updateTable('reads')
					.set({
						start_date: startDate,
						finish_date: finishDate
					})
					.where('reader_id', '=', readerId)
					.where('book_id', '=', bookId)
					.execute();
				await db
					.updateTable('reader_labels')
					.set({
						label_name: status
					})
					.where('reader_id', '=', readerId)
					.where('book_id', '=', bookId)
					.execute();
				return { success: true, message: 'Updated!' };
			} else if (type === 'remove') {
				await db
					.deleteFrom('reads')
					.where('reader_id', '=', readerId)
					.where('book_id', '=', bookId)
					.execute();
				await db
					.deleteFrom('reader_labels')
					.where('reader_id', '=', readerId)
					.where('book_id', '=', bookId)
					.execute();
				return { success: true, message: 'Removed!' };
			} else {
				return fail(400);
			}
		} catch {
			return fail(400);
		}
	}
};
