import { db } from '$lib/server/db/db';
import { listFiltersSchema, seriesListSchema } from '$lib/server/zod/schema.js';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const form = await superValidate(request, zod(listFiltersSchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'An error has occurred' }, { status: 400 });
		}

		const searchParams = new URLSearchParams(form.data.filters);
		const series_list = await superValidate(searchParams, zod(seriesListSchema));

		if (series_list.valid && series_list.data.serieslist) {
			return message(form, { type: 'Success', text: 'Saved filters as default!' });
		}

		searchParams.delete('serieslist');
		searchParams.delete('page');
		searchParams.delete('q');

		await db
			.insertInto('saved_filter')
			.values({
				filters: form.data.filters,
				item_name: 'series',
				user_id: locals.user.id,
			})
			.onConflict((oc) =>
				oc.columns(['user_id', 'item_name']).doUpdateSet({
					filters: form.data.filters,
				}),
			)
			.execute();

		return message(form, { type: 'Success', text: 'Saved filters as default!' });
	},
};
