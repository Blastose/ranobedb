import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { userListReleaseSchema } from '$lib/server/zod/schema';
import { db } from '$lib/server/db/db';
import { DBReleaseListActions } from '$lib/server/db/user/release-list';

export const actions = {
	default: async ({ params, request, locals }) => {
		const releaseId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod4(userListReleaseSchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		let messageText = '';
		const dbReleaseListActions = new DBReleaseListActions(db);
		try {
			if (form.data.type === 'add') {
				await dbReleaseListActions.addReleaseToList({
					user_id: user.id,
					release_id: releaseId,
					release_status: form.data.release_status,
				});
				messageText = 'Added release to list!';
			} else if (form.data.type === 'update') {
				await dbReleaseListActions.editReleaseInList({
					user_id: user.id,
					release_id: releaseId,
					release_status: form.data.release_status,
				});
				messageText = 'Updated release successfully!';
			} else if (form.data.type === 'delete') {
				await dbReleaseListActions.removeReleaseFromList({
					release_id: releaseId,
					user_id: user.id,
				});
				messageText = 'Removed release from list!';
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
