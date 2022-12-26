import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async () => {
	const series = await db.selectFrom('book_series').selectAll().orderBy('title_romaji').execute();

	return { series };
};
