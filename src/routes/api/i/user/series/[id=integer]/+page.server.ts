import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userListSeriesSchema } from '$lib/server/zod/schema';
import { db } from '$lib/server/db/db';
import { DBSeriesListActions } from '$lib/server/db/user/series-list';
import { defaultUserListLabelsMap } from '$lib/db/dbConsts';

export const actions = {
	default: async ({ params, request, locals }) => {
		const seriesId = Number(params.id);
		if (!locals.user) {
			return fail(401);
		}

		const user = locals.user;
		const form = await superValidate(request, zod(userListSeriesSchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid form entries' });
		}

		let messageText = '';
		const dbSeriesListActions = new DBSeriesListActions(db);
		const labelIds = form.data.labels.map((v) => v.id);
		const readingStatusId = defaultUserListLabelsMap.get(form.data.readingStatus) ?? 1;

		try {
			if (form.data.type === 'add') {
				await dbSeriesListActions.addSeriesToList({
					trx: undefined,
					series_id: seriesId,
					user_id: user.id,
					labelIds,
					readingStatusId,
					langs: form.data.langs,
					formats: form.data.formats,
				});
				messageText = 'Added series to list!';
			} else if (form.data.type === 'update') {
				await dbSeriesListActions.editSeriesInList({
					series_id: seriesId,
					user_id: user.id,
					labelIds,
					readingStatusId,
					langs: form.data.langs,
					formats: form.data.formats,
				});
				messageText = 'Updated series successfully!';
			} else if (form.data.type === 'delete') {
				await dbSeriesListActions.removeSeriesFromList({ series_id: seriesId, user_id: user.id });
				messageText = 'Removed series from list!';
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
