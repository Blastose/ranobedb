import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { userListBookSchema } from '$lib/zod/schema';
import { addBookToList, editBookInList, removeBookFromList } from '$lib/server/db/user/list';

export const actions = {
	default: async ({ params, request, locals }) => {
		const bookId = Number(params.id);
		const session = await locals.auth.validate();
		if (!session) {
			return fail(401);
		}

		const user = session.user;
		const form = await superValidate(request, userListBookSchema);
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		console.log(form);

		const addBookParams = {
			userId: user.userId,
			bookId,
			labelIds: form.data.labels.map((v) => v.id),
			score: form.data.score,
			started: form.data.started,
			finished: form.data.finished,
			notes: form.data.notes
		};

		try {
			if (form.data.type === 'add') {
				await addBookToList(addBookParams);
			} else if (form.data.type === 'update') {
				await editBookInList(addBookParams);
			} else if (form.data.type === 'delete') {
				await removeBookFromList(addBookParams);
			}
		} catch (e) {
			console.log(e);
			return message(form, { type: 'error', text: 'An error has occurred' }, { status: 400 });
		}

		return message(form, { type: 'success', text: 'Success' });
	}
} satisfies Actions;
