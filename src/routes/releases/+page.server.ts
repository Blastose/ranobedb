import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getReleases } from '$lib/server/db/releases/releases.js';

export const load = async ({ url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const {
		result: releases,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(getReleases, {
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
