import { getBooks } from '$lib/server/db/books/query.js';
import { db } from '$lib/server/db/db.js';
import {
	bookFiltersSchema,
	listFiltersSchema,
	pageSchema,
	qSchema,
} from '$lib/server/zod/schema.js';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const userListFilters =
		locals.user && new URLSearchParams(url.search).size === 0 // Use is logged in and there is no current filters
			? await db
					.selectFrom('saved_filter')
					.select('saved_filter.filters')
					.where('saved_filter.user_id', '=', locals.user.id)
					.where('saved_filter.item_name', '=', 'book')
					.where('saved_filter.is_list', '=', false)
					.executeTakeFirst()
			: null;

	if (userListFilters?.filters && new URLSearchParams(url.search).size === 0) {
		const newUrlSearchParams = new URLSearchParams(userListFilters?.filters);
		const newUrl = new URL(url);
		newUrl.search = newUrlSearchParams.toString();
		redirect(307, newUrl);
	}

	const urlSearchForm = await superValidate(
		{ filters: url.search, target: 'book', is_list: false },
		zod4(listFiltersSchema),
	);

	const form = await superValidate(url, zod4(bookFiltersSchema));

	const res = await getBooks({
		currentPage,
		db,
		q,
		url,
		listUser: locals.user,
		currentUser: locals.user,
		form,
		limit: 24,
	});

	return {
		books: res.books,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
		filtersFormObj: res.filtersFormObj,
		allCustLabels: res.allCustLabels,
		urlSearchForm,
	};
};
