import { sql, type Kysely } from 'kysely';
import type { DB } from '../dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';
import { DBPublishers } from './publishers';

export async function getPublishers(params: {
	currentPage: number;
	q: string | undefined | null;
	db: Kysely<DB>;
	currentUser: User | null;
	url: URL;
	limit: number;
}) {
	const { currentPage, q, db, currentUser, limit } = params;

	const dbPublishers = DBPublishers.fromDB(db, currentUser);

	let query = dbPublishers
		.getPublishers()
		.clearSelect()
		.select(['publisher.id', 'publisher.name', 'publisher.romaji']);

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
		limit: limit,
		page: currentPage,
	});

	return {
		publishers,
		count,
		currentPage,
		totalPages,
	};
}
