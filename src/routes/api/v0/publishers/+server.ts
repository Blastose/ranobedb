import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { sql } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

async function get(params: { url: URL; locals: App.Locals }) {
	const { url, locals } = params;
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const dbPublishers = DBPublishers.fromDB(db, locals.user);

	let query = dbPublishers
		.getPublishers()
		.clearSelect()
		.select(['publisher.id', 'publisher.name', 'publisher.romaji'])
		.where('publisher.hidden', '=', false);

	if (q) {
		query = query
			.where(
				(eb) =>
					eb.fn('greatest', [
						eb.fn('word_similarity', [eb.val(q), eb.ref('publisher.name')]),
						eb.fn('word_similarity', [eb.val(q), eb.ref('publisher.romaji')]),
					]),
				'>',
				0.3,
			)
			.where((eb) =>
				eb.or([
					eb(eb.val(q), sql.raw('<%'), eb.ref('publisher.name')).$castTo<boolean>(),
					eb(eb.val(q), sql.raw('<%'), eb.ref('publisher.romaji')).$castTo<boolean>(),
				]),
			)
			.orderBy(
				(eb) =>
					eb.fn('greatest', [
						eb.fn('word_similarity', [eb.val(q), eb.ref('publisher.name')]),
						eb.fn('word_similarity', [eb.val(q), eb.ref('publisher.romaji')]),
					]),
				'desc',
			);
	}

	query = query.orderBy((eb) => eb.fn.coalesce('publisher.romaji', 'publisher.name'));

	const {
		result: publishers,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 5,
		page: currentPage,
	});

	return {
		publishers,
		count,
		currentPage,
		totalPages,
	};
}

export type PublishersApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await get({ url, locals }));
};
