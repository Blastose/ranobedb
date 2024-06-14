import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';

export const load = async ({ url, locals }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const q = url.searchParams.get('q');
	const dbReleases = DBReleases.fromDB(db, locals.user);

	let query = dbReleases
		.getReleases()
		.where('release.hidden', '=', false)
		.orderBy((eb) => eb.fn.coalesce('release.romaji', 'release.title'));

	if (q) {
		query = query.where((eb) =>
			eb.or([eb('release.romaji', 'ilike', `%${q}%`), eb('release.title', 'ilike', `%${q}%`)]),
		);
	}

	const {
		result: releases,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
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
