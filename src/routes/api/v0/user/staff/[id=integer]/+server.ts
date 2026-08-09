import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { userListStaffSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { db } from '$lib/server/db/db';
import type {
	DB,
	Language,
	ReleaseFormat,
	UserListStaffFormat,
	UserListStaffLang,
} from '$lib/server/db/dbTypes';
import type { Insertable, Transaction } from 'kysely';

const apiUserListStaffSchema = userListStaffSchema.omit({
	type: true,
});

// a copy of /i/user/staff/[id=integer]/+page_server.ts
async function addUserListStaffLangsAndFormats(params: {
	staff_id: number;
	user_id: string;
	langs: Language[];
	formats: ReleaseFormat[];
	trx: Transaction<DB>;
}) {
	const { trx } = params;
	await trx
		.deleteFrom('user_list_staff_lang')
		.where('user_list_staff_lang.staff_id', '=', params.staff_id)
		.where('user_list_staff_lang.user_id', '=', params.user_id)
		.execute();
	await trx
		.deleteFrom('user_list_staff_format')
		.where('user_list_staff_format.staff_id', '=', params.staff_id)
		.where('user_list_staff_format.user_id', '=', params.user_id)
		.execute();
	const userListstaffLangs = params.langs.map((v) => ({
		lang: v,
		staff_id: params.staff_id,
		user_id: params.user_id,
	})) satisfies Insertable<UserListStaffLang>[];
	if (userListstaffLangs.length > 0) {
		await trx.insertInto('user_list_staff_lang').values(userListstaffLangs).execute();
	}
	const userListstaffFormats = params.formats.map((v) => ({
		format: v,
		staff_id: params.staff_id,
		user_id: params.user_id,
	})) satisfies Insertable<UserListStaffFormat>[];
	if (userListstaffFormats.length > 0) {
		await trx.insertInto('user_list_staff_format').values(userListstaffFormats).execute();
	}
}

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

	// transaction is also copied from /i/user/staff/[id=integer]/+page_server.ts
	if (!existingUserStaff) {
		await db.transaction().execute(async (trx) => {
			await trx
				.insertInto('user_list_staff')
				.values({
					notify_book: data.notify_book,
					show_upcoming: data.show_upcoming,
					only_first_book: data.only_first_book,
					staff_id,
					user_id: user.id,
				})
				.execute();
			await addUserListStaffLangsAndFormats({
				formats: data.formats,
				langs: data.langs,
				staff_id,
				user_id: user.id,
				trx: trx,
			});
		});
	} else {
		await db.transaction().execute(async (trx) => {
			await trx
				.insertInto('user_list_staff')
				.values({
					notify_book: data.notify_book,
					show_upcoming: data.show_upcoming,
					only_first_book: data.only_first_book,
					staff_id,
					user_id: user.id,
				})
				.onConflict((oc) =>
					oc.columns(['staff_id', 'user_id']).doUpdateSet({
						notify_book: data.notify_book,
						show_upcoming: data.show_upcoming,
						only_first_book: data.only_first_book,
					}),
				)
				.execute();
			await addUserListStaffLangsAndFormats({
				formats: data.formats,
				langs: data.langs,
				staff_id,
				user_id: user.id,
				trx: trx,
			});
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
	// transaction is also copied from /i/user/staff/[id=integer]/+page_server.ts
	await db.transaction().execute(async (trx) => {
		await trx
			.deleteFrom('user_list_staff_format')
			.where('user_list_staff_format.staff_id', '=', staff_id)
			.where('user_list_staff_format.user_id', '=', user.id)
			.execute();
		await trx
			.deleteFrom('user_list_staff_lang')
			.where('user_list_staff_lang.staff_id', '=', staff_id)
			.where('user_list_staff_lang.user_id', '=', user.id)
			.execute();
		await trx
			.deleteFrom('user_list_staff')
			.where('user_list_staff.staff_id', '=', staff_id)
			.where('user_list_staff.user_id', '=', user.id)
			.execute();
	});

	return json({ success: true });
}

export const PUT: RequestHandler = addOrEditUserListStaff;
export const DELETE: RequestHandler = deleteUserListStaff;
