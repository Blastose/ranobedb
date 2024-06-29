import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;
	const qS = await superValidate(url, zod(qSchema));
	const q = qS.data.q;

	const dbStaff = DBStaff.fromDB(db, locals.user);

	let query = dbStaff
		.getStaff()
		.where('staff.hidden', '=', false)
		.orderBy((eb) => eb.fn.coalesce('staff_alias.romaji', 'staff_alias.name'));
	if (q) {
		query = query.where((eb) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('staff_alias.name', 'ilike', `%${q}%`));
			ors.push(eb('staff_alias.romaji', 'ilike', `%${q}%`));
			if (q.includes(' ')) {
				const reversed = q.split(' ').reverse().join('% ');
				ors.push(eb('staff_alias.name', 'ilike', `%${reversed}%`));
				ors.push(eb('staff_alias.romaji', 'ilike', `%${reversed}%`));
			}

			return eb.or(ors);
		});
	}

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
