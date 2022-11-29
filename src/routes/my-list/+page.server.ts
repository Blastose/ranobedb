import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const reads = await db
		.selectFrom('user')
		.innerJoin('reads', 'user.reader_id', 'reads.reader_id')
		.innerJoin('book', 'book.id', 'reads.book_id')
		.select(['book.title', 'book.volume'])
		.where('user.id', '=', session.userId)
		.execute();

	if (!reads) {
		throw error(500);
	}
	return { reads };
};
