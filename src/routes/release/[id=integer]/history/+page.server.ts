import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const releaseId = Number(id);
	const currentPage = Number(url.searchParams.get('page')) || 1;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(new DBChanges(db).getChanges('release', releaseId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});

	const dbReleases = DBReleases.fromDB(db, locals.user);
	const release = await dbReleases.getRelease(releaseId).executeTakeFirstOrThrow();
	if (!release) {
		error(404);
	}

	return { changes, release, count, currentPage, totalPages };
};
