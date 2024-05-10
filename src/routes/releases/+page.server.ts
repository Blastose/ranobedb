import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const dbReleases = DBReleases.fromDB(db, locals.user);
	const {
		result: releases,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(dbReleases.getReleases(), {
		limit: 24,
		page: currentPage,
	});

	return {
		releases,
		count,
		currentPage,
		totalPages,
	};
};
