import { addCharacterBetweenString } from '$lib/db/match.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	let query = db
		.selectFrom('tag')
		.selectAll('tag')
		.select((eb) => eb.fn.count('tag.id').as('count'))
		.innerJoin('series_tag', 'series_tag.tag_id', 'tag.id')
		.groupBy('tag.id')
		.orderBy('count desc');
	if (q) {
		query = query.where('tag.name', 'ilike', `%${addCharacterBetweenString(q, '%')}%`);
	}

	const {
		result: tags,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		tags,
		count,
		totalPages,
		currentPage,
	};
};
