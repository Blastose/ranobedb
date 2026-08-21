import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { userListStaffSchema } from '$lib/server/zod/schema';
import { db } from '$lib/server/db/db';
import { DBStaffListActions } from '$lib/server/db/user/staff-list';

export const actions = {
	default: async ({ params, request, locals }) => {
		const staffId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod4(userListStaffSchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		let messageText = '';
		const dbStaffActions = new DBStaffListActions(db);
		try {
			if (form.data.type === 'add') {
				await dbStaffActions.addStaffToList({
					notify_book: form.data.notify_book,
					show_upcoming: form.data.show_upcoming,
					only_first_book: form.data.only_first_book,
					staff_id: staffId,
					user_id: user.id,
					formats: form.data.formats,
					langs: form.data.langs,
				});
				messageText = 'Followed staff!';
			} else if (form.data.type === 'update') {
				await dbStaffActions.editStaffInList({
					notify_book: form.data.notify_book,
					show_upcoming: form.data.show_upcoming,
					only_first_book: form.data.only_first_book,
					staff_id: staffId,
					user_id: user.id,
					formats: form.data.formats,
					langs: form.data.langs,
				});
				messageText = 'Updated staff follow settings successfully!';
			} else if (form.data.type === 'delete') {
				await dbStaffActions.removeStaffInList({
					staff_id: staffId,
					user_id: user.id,
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
