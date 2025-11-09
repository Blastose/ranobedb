import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const releaseId = Number(id);
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(new DBChanges(db).getChanges('release', releaseId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});

	const dbReleases = DBReleases.fromDB(db, locals.user);
	const release = await dbReleases
		.getRelease(releaseId)
		.clearSelect()
		.select(['release.title', 'release.romaji', 'release.lang'])
		.executeTakeFirstOrThrow();
	if (!release) {
		error(404);
	}

	return { changes, release, count, currentPage, totalPages };
};
