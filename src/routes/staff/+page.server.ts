import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { pageSchema, qSchema } from '$lib/server/zod/schema.js';
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
		query = query.where((eb) =>
			eb.or([
				eb('staff_alias.name', 'ilike', `%${q}%`),
				eb('staff_alias.romaji', 'ilike', `%${q}%`),
			]),
		);
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
