import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { sql } from 'kysely';
import { getPaginationFromUrl } from '$lib/util/getPaginationFromUrl';

export const load: PageServerLoad = async ({ url }) => {
	const { limit, page } = getPaginationFromUrl(url);

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

	const count = Number(books[0].count);
	return {
		books: books,
		count: count,
		totalPages: Math.ceil(count / limit)
	};
};
