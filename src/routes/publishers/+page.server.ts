import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const dbPublishers = DBPublishers.fromDB(db, locals.user);

	let query = dbPublishers.getPublishers().where('publisher.hidden', '=', false);

	if (q) {
		query = query
			.where(
				(eb) =>
					eb.fn('greatest', [
						eb.fn('strict_word_similarity', [eb.val(q), eb.ref('publisher.name')]),
						eb.fn('strict_word_similarity', [eb.val(q), eb.ref('publisher.romaji')]),
					]),
				'>',
				0.15,
			)
			.orderBy(
				(eb) =>
					eb.fn('greatest', [
						eb.fn('strict_word_similarity', [eb.val(q), eb.ref('publisher.name')]),
						eb.fn('strict_word_similarity', [eb.val(q), eb.ref('publisher.romaji')]),
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
		limit: 40,
		page: currentPage,
	});

	return {
		publishers,
		count,
		currentPage,
		totalPages,
	};
};
