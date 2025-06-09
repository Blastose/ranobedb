import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userListPublisherSchema } from '$lib/server/zod/schema';
import { db } from '$lib/server/db/db';

export const actions = {
	default: async ({ params, request, locals }) => {
		const publisherId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod(userListPublisherSchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		let messageText = '';

		try {
			if (form.data.type === 'add') {
				await db.transaction().execute(async (trx) => {
					await trx
						.insertInto('user_list_publisher')
						.values({
							publisher_id: publisherId,
							user_id: user.id,
						})
						.onConflict((oc) => oc.doNothing())
						.execute();
				});
				messageText = 'Favorited publisher!';
			} else if (form.data.type === 'update') {
				// Do nothing
			} else if (form.data.type === 'delete') {
				await db.transaction().execute(async (trx) => {
					await trx
						.deleteFrom('user_list_publisher')
						.where('user_list_publisher.publisher_id', '=', publisherId)
						.where('user_list_publisher.user_id', '=', user.id)
						.execute();
				});
				messageText = 'Unfavorited publisher!';
			}
		} catch (e) {
			console.log(e);
			// TODO This doesn't show the message on error for some reason
			return message(
				form,
				{ type: 'error', text: 'An unknown error has occurred!' },
				{ status: 400 },
			);
		}

		return message(form, { type: 'success', text: messageText });
	},
} satisfies Actions;
