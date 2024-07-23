import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { sql } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;
	const qS = await superValidate(url, zod(qSchema));
	const q = qS.data.q;

	const dbStaff = DBStaff.fromDB(db, locals.user);

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
		limit: 40,
		page: currentPage,
	});

	return {
		staff,
		count,
		currentPage,
		totalPages,
	};
};
