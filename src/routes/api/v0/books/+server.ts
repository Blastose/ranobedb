import { db } from '$lib/server/db/db.js';
import { bookFiltersSchema, pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getBooks } from '$lib/server/db/books/query';

async function get(params: { url: URL; locals: App.Locals }) {
	const { url, locals } = params;
	const page = await superValidate(url, zod4(pageSchema));
	const qS = await superValidate(url, zod4(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const form = await superValidate(url, zod4(bookFiltersSchema));
	const res = await getBooks({
		currentPage,
		db,
		q,
		url,
		listUser: null,
		currentUser: locals.user,
		form,
		limit: form.data.limit,
	});

	return {
		books: res.books,
		count: res.count,
		currentPage: res.currentPage,
		totalPages: res.totalPages,
	};
}

export type BooksApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await get({ url, locals }));
};
