import { DBChanges, historyItemsPerPage } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const staffId = Number(id);
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;

	const {
		result: changes,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(new DBChanges(db).getChanges('staff', staffId), {
		limit: historyItemsPerPage,
		page: currentPage,
	});
	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(staffId).executeTakeFirstOrThrow();
	if (!staff) {
		error(404);
	}

	return { changes, staff, count, currentPage, totalPages };
};
