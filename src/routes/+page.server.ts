import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async () => {
	const allBooksPromise = db.selectFrom('book_info').selectAll().orderBy('title_romaji').execute();
	const recentlyAddedBooksPromise = db
		.selectFrom('book_info')
		.selectAll()
		.orderBy('id', 'desc')
		.limit(16)
		.execute();

	try {
		const [allBooks, recentlyAddedBooks] = await Promise.all([
			allBooksPromise,
			recentlyAddedBooksPromise
		]);
		return { allBooks, recentlyAddedBooks };
	} catch {
		throw error(500);
	}
};
