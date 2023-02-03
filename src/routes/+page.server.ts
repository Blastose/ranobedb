import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load = (async () => {
	const allBooksPromise = db.selectFrom('book_info').selectAll().orderBy('title_romaji').execute();
	const recentlyAddedBooksPromise = db
		.selectFrom('book_info')
		.selectAll()
		.orderBy('id', 'desc')
		.limit(16)
		.execute();
	const recentlyReleasedBooksPromise = db
		.selectFrom('book_info')
		.selectAll()
		.orderBy('release_date', 'desc')
		.limit(16)
		.execute();

	try {
		const [allBooks, recentlyAddedBooks, recentlyReleasedBooks] = await Promise.all([
			allBooksPromise,
			recentlyAddedBooksPromise,
			recentlyReleasedBooksPromise
		]);
		return { allBooks, recentlyAddedBooks, recentlyReleasedBooks };
	} catch {
		throw error(500);
	}
}) satisfies PageServerLoad;
