import { db } from '$lib/server/db/db';
import { bookListSchema, listFiltersSchema } from '$lib/server/zod/schema.js';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const form = await superValidate(request, zod4(listFiltersSchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'An error has occurred' }, { status: 400 });
		}

		const searchParams = new URLSearchParams(form.data.filters);
		const book_list = await superValidate(searchParams, zod4(bookListSchema));

		if (book_list.valid && book_list.data.booklist) {
			return message(form, { type: 'Success', text: 'Saved filters as default!' });
		}

		searchParams.delete('booklist');
		searchParams.delete('serieslist');
		searchParams.delete('page');
		searchParams.delete('q');

		await db
			.insertInto('saved_filter')
			.values({
				filters: searchParams.toString(),
				item_name: form.data.target,
				user_id: locals.user.id,
				is_list: form.data.is_list,
			})
			.onConflict((oc) =>
				oc.columns(['user_id', 'item_name', 'is_list']).doUpdateSet({
					filters: searchParams.toString(),
				}),
			)
			.execute();

		return message(form, { type: 'Success', text: 'Saved filters as default!' });
	},
};
