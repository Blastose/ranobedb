import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { userListStaffSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { db } from '$lib/server/db/db';
import { DBStaffListActions } from '$lib/server/db/user/staff-list';

const apiUserListStaffSchema = userListStaffSchema.omit({
	type: true,
});

async function validateRequest(event: RequestEvent) {
	const { params, locals } = event;

	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	if (!params.id) {
		error(400, 'No ID specified');
	}

	return {
		user: locals.user,
		staff_id: parseInt(params.id),
	};
}

async function addOrEditUserListStaff(event: RequestEvent) {
	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const validatedBody = apiUserListStaffSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json(z.treeifyError(validatedBody.error), { status: 400 });
	}

	const data = validatedBody.data;
	const { user, staff_id } = await validateRequest(event);

	const [existInDatabase, existingUserStaff] = await Promise.all([
		db.selectFrom('staff').select('id').where('staff.id', '=', staff_id).executeTakeFirst(),
		db
			.selectFrom('user_list_staff')
			.select('staff_id')
			.where('user_id', '=', user.id)
			.where('staff_id', '=', staff_id)
			.executeTakeFirst(),
	]);

	if (!existInDatabase) {
		error(400, 'Staff does not exist');
	}

	const dbStaffActions = new DBStaffListActions(db);
	if (!existingUserStaff) {
		await dbStaffActions.addStaffToList({
			user_id: user.id,
			staff_id,
			...data,
		});
	} else {
		await dbStaffActions.editStaffInList({
			user_id: user.id,
			staff_id,
			...data,
		});
	}
	return json({ success: true, action: existingUserStaff ? 'edit' : 'add' });
}

async function deleteUserListStaff(event: RequestEvent) {
	const { user, staff_id } = await validateRequest(event);
	const existingUserStaff = await db
		.selectFrom('user_list_staff')
		.select('staff_id')
		.where('user_id', '=', user.id)
		.where('staff_id', '=', staff_id)
		.executeTakeFirst();

	if (!existingUserStaff) {
		error(400, 'Staff is not in the list');
	}

	const dbStaffActions = new DBStaffListActions(db);
	await dbStaffActions.removeStaffInList({
		user_id: user.id,
		staff_id,
	});
	return json({ success: true });
}

export const PUT: RequestHandler = addOrEditUserListStaff;
export const DELETE: RequestHandler = deleteUserListStaff;
