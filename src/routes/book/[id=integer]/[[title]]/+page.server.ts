import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const book = await db.selectFrom('book_info').selectAll().where('id', '=', id).executeTakeFirst();

	if (!book) {
		throw error(404);
	}
	return { book };
};
