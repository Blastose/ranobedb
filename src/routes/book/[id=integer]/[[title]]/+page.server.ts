import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const bookPromise = db
		.selectFrom('book_info')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();

	const releasesPromise = db
		.selectFrom('book_release')
		.selectAll()
		.where('book_id', '=', id)
		.execute();

	const sameSeriesPromise = db
		.selectFrom('book_same_series')
		.selectAll()
		.where('orig_book_id', '=', id)
		.execute();

	const [book, releases, sameSeries] = await Promise.all([
		bookPromise,
		releasesPromise,
		sameSeriesPromise
	]);
	if (!book) {
		throw error(404);
	}
	return { book, releases, sameSeries };
};
