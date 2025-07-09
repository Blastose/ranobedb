import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
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
		const form = await superValidate(request, zod4(userListSeriesSchema));
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
					selectedCustLabels: form.data.selectedCustLabels,
					show_upcoming: form.data.show_upcoming,
					volumes_read: form.data.volumes_read,
					notes: form.data.notes ?? '',
					started: form.data.started || null,
					finished: form.data.finished || null,
					score: form.data.score,
					notify_book: form.data.notify_book,
					notify_when_released: form.data.notify_when_released,
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
					selectedCustLabels: form.data.selectedCustLabels,
					show_upcoming: form.data.show_upcoming,
					volumes_read: form.data.volumes_read,
					notes: form.data.notes ?? '',
					started: form.data.started || null,
					finished: form.data.finished || null,
					score: form.data.score,
					notify_book: form.data.notify_book,
					notify_when_released: form.data.notify_when_released,
				});
				messageText = 'Updated series successfully!';
			} else if (form.data.type === 'delete') {
				await dbSeriesListActions.removeSeriesFromList({
					series_id: seriesId,
					user_id: user.id,
					remove_all: true,
				});
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
