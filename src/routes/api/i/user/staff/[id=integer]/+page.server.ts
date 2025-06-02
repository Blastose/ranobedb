import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userListStaffSchema } from '$lib/server/zod/schema';
import type {
	Language,
	DB,
	ReleaseFormat,
	UserListStaffLang,
	UserListStaffFormat,
} from '$lib/server/db/dbTypes';
import type { Insertable, Transaction } from 'kysely';
import { db } from '$lib/server/db/db';

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

export const actions = {
	default: async ({ params, request, locals }) => {
		const staffId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod(userListStaffSchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		let messageText = '';

		try {
			if (form.data.type === 'add') {
				await db.transaction().execute(async (trx) => {
					await trx
						.insertInto('user_list_staff')
						.values({
							notify_book: true,
							show_upcoming: true,
							only_first_book: form.data.only_first_book,
							staff_id: staffId,
							user_id: user.id,
						})
						.execute();
					await addUserListStaffLangsAndFormats({
						formats: form.data.formats,
						langs: form.data.langs,
						staff_id: staffId,
						user_id: user.id,
						trx: trx,
					});
				});
				messageText = 'Followed staff!';
			} else if (form.data.type === 'update') {
				await db.transaction().execute(async (trx) => {
					await trx
						.insertInto('user_list_staff')
						.values({
							notify_book: true,
							show_upcoming: true,
							only_first_book: form.data.only_first_book,
							staff_id: staffId,
							user_id: user.id,
						})
						.onConflict((oc) =>
							oc.columns(['staff_id', 'user_id']).doUpdateSet({
								notify_book: form.data.notify_book,
								show_upcoming: form.data.show_upcoming,
							}),
						)
						.execute();
					await addUserListStaffLangsAndFormats({
						formats: form.data.formats,
						langs: form.data.langs,
						staff_id: staffId,
						user_id: user.id,
						trx: trx,
					});
				});
				messageText = 'Updated staff follow settings successfully!';
			} else if (form.data.type === 'delete') {
				await db.transaction().execute(async (trx) => {
					await trx
						.deleteFrom('user_list_staff_format')
						.where('user_list_staff_format.staff_id', '=', staffId)
						.where('user_list_staff_format.user_id', '=', user.id)
						.execute();
					await trx
						.deleteFrom('user_list_staff_lang')
						.where('user_list_staff_lang.staff_id', '=', staffId)
						.where('user_list_staff_lang.user_id', '=', user.id)
						.execute();
					await trx
						.deleteFrom('user_list_staff')
						.where('user_list_staff.staff_id', '=', staffId)
						.where('user_list_staff.user_id', '=', user.id)
						.execute();
				});
				messageText = 'Unfollowed staff!';
			}
		} catch (e) {
			console.log(e);
			return message(
				form,
				{ type: 'error', text: 'An unknown error has occurred!' },
				{ status: 400 },
			);
		}

		return message(form, { type: 'success', text: messageText });
	},
} satisfies Actions;
