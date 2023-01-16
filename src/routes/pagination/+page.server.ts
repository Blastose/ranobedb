import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ url }) => {
	const limit = 5;
	let page = Number(url.searchParams.get('page') ?? '1');
	if (page < 1) {
		page = 1;
	}
	console.log(page);

	const books = await db
		.selectFrom('book_info')
		.selectAll('book_info')
		.select(sql<string>`count(*) over()`.as('count'))
		.orderBy('title_romaji')
		.limit(limit)
		.offset(limit * (page - 1))
		.execute();

	if (!books) {
		throw error(500);
	}

	if (books.length < 1) {
		throw error(400);
	}

	const count = books[0].count;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return { books: books.map(({ count, ...s }) => s), count };
};
