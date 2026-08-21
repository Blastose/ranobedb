import { sql, type Kysely } from 'kysely';
import type { DB } from '../dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';
import { DBStaff } from './staff';
import type { staffFiltersSchema } from '$lib/server/zod/schema';
import type { Infer, SuperValidated } from 'sveltekit-superforms';

export async function getStaff(params: {
	currentPage: number;
	q: string | undefined | null;
	db: Kysely<DB>;
	currentUser: User | null;
	listUser: Pick<User, 'id'> | null;
	limit: number;
	form: SuperValidated<Infer<typeof staffFiltersSchema>>;
}) {
	const { currentPage, q, db, currentUser, limit, listUser, form } = params;

	const dbStaff = DBStaff.fromDB(db, currentUser);

	let query = dbStaff.getStaff().where('staff.hidden', '=', false);

	if (listUser) {
		query = query
			.innerJoin('user_list_staff', 'user_list_staff.staff_id', 'staff.id')
			.where('user_list_staff.user_id', '=', listUser.id);
	}

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
			.groupBy(['staff.id', 'staff.lang', 'staff_alias.name', 'staff_alias.romaji'])
			.orderBy('sim_score', 'desc');
	}

	const useLangFilters = form.data.lang.length > 0;
	if (useLangFilters) {
		query = query.where((eb) => {
			const filters = form.data.lang.map((lang) => eb('staff.lang', '=', lang));
			return eb.or(filters);
		});
	}

	if (form.data.sort === 'Name desc') {
		query = query.orderBy((eb) => eb.fn.coalesce('staff_alias.romaji', 'staff_alias.name'), 'desc');
	} else {
		query = query.orderBy((eb) => eb.fn.coalesce('staff_alias.romaji', 'staff_alias.name'), 'asc');
	}

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
