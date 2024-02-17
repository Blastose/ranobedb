import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { defaultUserListLabelsMap, userListBookSchema } from '$lib/zod/schema';
import { addBookToList, editBookInList, removeBookFromList } from '$lib/server/db/user/list';

export const actions = {
	default: async ({ params, request, locals }) => {
		const bookId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, userListBookSchema);
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
			score: form.data.score,
			started: form.data.started || null,
			finished: form.data.finished || null,
			notes: form.data.notes
		};

		let messageText = '';
		try {
			if (form.data.type === 'add') {
				await addBookToList(addBookParams);
				messageText = 'Added book to list';
			} else if (form.data.type === 'update') {
				await editBookInList(addBookParams);
				messageText = 'Updated book successfully';
			} else if (form.data.type === 'delete') {
				await removeBookFromList(addBookParams);
				messageText = 'Removed book from list';
			}
		} catch (e) {
			console.log(e);
			return message(form, { type: 'error', text: 'An error has occurred' }, { status: 400 });
		}

		return message(form, { type: 'success', text: messageText });
	}
} satisfies Actions;
