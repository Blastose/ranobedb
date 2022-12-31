import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async () => {
	const releases = await db.selectFrom('release').selectAll().orderBy('id').execute();

	return { releases };
};
