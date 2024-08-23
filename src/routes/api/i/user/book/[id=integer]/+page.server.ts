import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userListBookSchema } from '$lib/server/zod/schema';
import { defaultUserListLabelsMap } from '$lib/db/dbConsts';
import { DBListActions } from '$lib/server/db/user/list';
import { db } from '$lib/server/db/db';

export const actions = {
	default: async ({ params, request, locals }) => {
		const bookId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod(userListBookSchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		const labelIds = form.data.labels.map((v) => v.id);
		const readingStatusId = defaultUserListLabelsMap.get(form.data.readingStatus) ?? 1;

		const addBookParams = {
			userId: user.id,
			bookId,
			labelIds,
			readingStatusId,
			selectedCustLabels: form.data.selectedCustLabels,
			score: form.data.score,
			started: form.data.started || null,
			finished: form.data.finished || null,
			notes: form.data.notes,
		};

		let messageText = '';
		const dbListActions = new DBListActions(db);
		try {
			if (form.data.type === 'add') {
				await dbListActions.addBookToList(addBookParams);
				messageText = 'Added book to list';
			} else if (form.data.type === 'update') {
				await dbListActions.editBookInList(addBookParams);
				messageText = 'Updated book successfully';
			} else if (form.data.type === 'delete') {
				await dbListActions.removeBookFromList(addBookParams);
				messageText = 'Removed book from list';
			}
		} catch (e) {
			console.log(e);
			return message(form, { type: 'error', text: 'An error has occurred' }, { status: 400 });
		}

		return message(form, { type: 'success', text: messageText });
	},
} satisfies Actions;
