import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import { userListReleaseSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { DBReleaseListActions } from '$lib/server/db/user/release-list';

const apiUserListReleaseSchema = userListReleaseSchema.omit({
	type: true,
	release_id: true,
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
		release_id: parseInt(params.id),
	};
}

async function addOrEditUserListRelease(event: RequestEvent) {
	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const validatedBody = apiUserListReleaseSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json(z.treeifyError(validatedBody.error), { status: 400 });
	}

	const { user, release_id } = await validateRequest(event);
	const data = validatedBody.data;

	const existInDatabase = await db
		.selectFrom('release')
		.where('release.id', '=', release_id)
		.executeTakeFirst();

	if (!existInDatabase) {
		error(400, 'Release does not exist');
	}

	const existingUserRelease = await db
		.selectFrom('user_list_release')
		.select('release_id')
		.where('user_id', '=', user.id)
		.where('release_id', '=', release_id)
		.executeTakeFirst();

	const dbReleaseListActions = new DBReleaseListActions(db);

	if (!existingUserRelease) {
		await dbReleaseListActions.addReleaseToList({
			release_id,
			release_status: data.release_status,
			user_id: user.id,
		});
	} else {
		await dbReleaseListActions.editReleaseInList({
			release_id,
			release_status: data.release_status,
			user_id: user.id,
		});
	}

	return json({ success: true, action: existingUserRelease ? 'edit' : 'add' });
}

async function deleteUserListRelease(event: RequestEvent) {
	const { user, release_id } = await validateRequest(event);
	const existingUserRelease = await db
		.selectFrom('user_list_release')
		.select('release_id')
		.where('user_id', '=', user.id)
		.where('release_id', '=', release_id)
		.executeTakeFirst();

	if (!existingUserRelease) {
		error(400, 'This release is not in the list');
	}

	const dbReleaseListActions = new DBReleaseListActions(db);
	await dbReleaseListActions.removeReleaseFromList({
		release_id,
		user_id: user.id,
	});

	return json({ success: true });
}

export const PUT: RequestHandler = addOrEditUserListRelease;
export const DELETE: RequestHandler = deleteUserListRelease;
