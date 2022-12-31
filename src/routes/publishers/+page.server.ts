import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async () => {
	const publishers = await db.selectFrom('publisher').selectAll().orderBy('id').execute();

	return { publishers };
};
