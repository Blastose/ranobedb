import { db } from '$lib/server/db/db';
import { bookListSchema, listFiltersSchema, seriesListSchema } from '$lib/server/zod/schema.js';
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

		const filterName = form.data.name;

		const searchParams = new URLSearchParams(form.data.filters);
		const book_list = await superValidate(searchParams, zod4(bookListSchema));
		const series_list = await superValidate(searchParams, zod4(seriesListSchema));

		if (
			(book_list.valid && book_list.data.booklist) ||
			(series_list.valid && series_list.data.serieslist)
		) {
			return message(form, {
				type: 'error',
				text: 'Cannot save filters when default list filters are currently applied. Click the Search button first to apply the current filters.',
			});
		}

		searchParams.delete('booklist');
		searchParams.delete('serieslist');
		searchParams.delete('page');

		const new_filters = searchParams.toString() || '';

		const existingCount = await db
			.selectFrom('saved_filter')
			.select(db.fn.countAll().as('count'))
			.where('saved_filter.user_id', '=', locals.user.id)
			.where('saved_filter.item_name', '=', form.data.target)
			.where('saved_filter.is_list', '=', form.data.is_list)
			.executeTakeFirstOrThrow();

		const nameExists = await db
			.selectFrom('saved_filter')
			.select('saved_filter.name')
			.where('saved_filter.user_id', '=', locals.user.id)
			.where('saved_filter.item_name', '=', form.data.target)
			.where('saved_filter.is_list', '=', form.data.is_list)
			.where('saved_filter.name', '=', filterName)
			.executeTakeFirst();

		if (Number(existingCount.count) >= 50 && !nameExists) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error saving filters, you can only save up to 50 filters per page.',
				},
				{ status: 400 },
			);
		}

		await db
			.insertInto('saved_filter')
			.values({
				filters: new_filters,
				item_name: form.data.target,
				user_id: locals.user.id,
				is_list: form.data.is_list,
				name: filterName,
			})
			.onConflict((oc) =>
				oc.columns(['user_id', 'item_name', 'is_list', 'name']).doUpdateSet({
					filters: new_filters,
				}),
			)
			.execute();

		return message(form, { type: 'success', text: `Saved filters as "${filterName}"!` });
	},
};
