import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async () => {
	const books = await db.selectFrom('book_info').selectAll().orderBy('title_romaji').execute();

	if (!books) {
		throw error(500);
	}
	return { books };
};
