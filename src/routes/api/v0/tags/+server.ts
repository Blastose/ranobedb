import { addCharacterBetweenString } from '$lib/db/match.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

async function get(params: { url: URL }) {
	const { url } = params;
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
		.orderBy('count', 'desc');
	if (q) {
		query = query.where((eb) =>
			eb.or([
				eb('tag.name', 'ilike', `%${addCharacterBetweenString(q, '%')}%`),
				eb('tag.id', '=', Number(q)),
			]),
		);
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
}

export type TagsApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url }) => {
	return json(await get({ url }));
};
