import { sql, type Kysely } from 'kysely';
import type { DB } from '../dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';
import { DBStaff } from './staff';

export async function getStaff(params: {
	currentPage: number;
	q: string | undefined | null;
	db: Kysely<DB>;
	currentUser: User | null;
	url: URL;
	limit: number;
}) {
	const { currentPage, q, db, currentUser, limit } = params;

	const dbStaff = DBStaff.fromDB(db, currentUser);

	let query = dbStaff.getStaff().where('staff.hidden', '=', false);
	if (q) {
		query = query
			.innerJoin('staff_alias as sa2', 'sa2.staff_id', 'staff.id')
			.select((eb) =>
				eb.fn
					.max(
						eb.fn('greatest', [
							eb.fn('word_similarity', [eb.val(q), eb.ref('sa2.name')]),
							eb.fn('word_similarity', [eb.val(q), eb.ref('sa2.romaji')]),
						]),
					)
					.as('sim_score'),
			)
			.where((eb) =>
				eb.or([
					eb(eb.val(q), sql.raw('<%'), eb.ref('sa2.name')).$castTo<boolean>(),
					eb(eb.val(q), sql.raw('<%'), eb.ref('sa2.romaji')).$castTo<boolean>(),
				]),
			)
			.having(
				(eb) =>
					eb.fn.max(
						eb.fn('greatest', [
							eb.fn('word_similarity', [eb.val(q), eb.ref('sa2.name')]),
							eb.fn('word_similarity', [eb.val(q), eb.ref('sa2.romaji')]),
						]),
					),
				'>',
				0.3,
			)
			.groupBy(['staff.id', 'staff_alias.name', 'staff_alias.romaji'])
			.orderBy(`sim_score desc`);
	}

	query = query.orderBy((eb) => eb.fn.coalesce('staff_alias.romaji', 'staff_alias.name'));

	const {
		result: staff,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: limit,
		page: currentPage,
	});

	return {
		staff,
		count,
		currentPage,
		totalPages,
	};
}
