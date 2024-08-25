import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import type { ReadingStatus } from '$lib/server/db/dbTypes.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import {
	getUserSeriesLabels,
	getUserSeriesLabelsForSeries,
} from '$lib/server/db/user/series-list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { userListSeriesSchema, type UserListFormType } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries.getSeriesOne(id).limit(1).executeTakeFirst();

	if (!series) {
		error(404);
	}

	const user = locals.user;

	await new DBChanges(db).itemHiddenError({
		item: series,
		itemId: id,
		itemName: 'series',
		title: getTitleDisplay({ obj: series, prefs: getDisplayPrefsUser(user).title_prefs }),
		user: user,
	});

	const userSeriesLabels = await db
		.selectFrom('user_list_series')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('user_list_series_label')
					.innerJoin('user_list_label', (join) =>
						join
							.onRef('user_list_label.user_id', '=', 'user_list_series_label.user_id')
							.onRef('user_list_label.id', '=', 'user_list_series_label.label_id'),
					)
					.select(['user_list_label.label', 'user_list_label.id'])
					.whereRef('user_list_series_label.series_id', '=', 'user_list_series.series_id')
					.whereRef('user_list_series_label.user_id', '=', 'user_list_series.user_id')
					.where('user_list_label.id', '<=', 10),
			).as('labels'),
			jsonArrayFrom(
				eb
					.selectFrom('user_list_series_lang')
					.select(['user_list_series_lang.lang'])
					.whereRef('user_list_series_lang.series_id', '=', 'user_list_series.series_id')
					.whereRef('user_list_series_lang.user_id', '=', 'user_list_series.user_id'),
			).as('langs'),
			jsonArrayFrom(
				eb
					.selectFrom('user_list_series_format')
					.select(['user_list_series_format.format'])
					.whereRef('user_list_series_format.series_id', '=', 'user_list_series.series_id')
					.whereRef('user_list_series_format.user_id', '=', 'user_list_series.user_id'),
			).as('formats'),
		])
		.where('user_list_series.user_id', '=', user?.id || '')
		.where('user_list_series.series_id', '=', id)
		.select([
			'user_list_series.series_id',
			'user_list_series.show_upcoming',
			'user_list_series.volumes_read',
			'user_list_series.score',
			'user_list_series.started',
			'user_list_series.finished',
			'user_list_series.notes',
		])
		.executeTakeFirst();

	let formType: UserListFormType;
	if (userSeriesLabels) {
		formType = 'update';
	} else {
		formType = 'add';
	}

	let readingStatus: ReadingStatus | undefined = undefined;
	if (userSeriesLabels) {
		// ids 1 to 10 are reserved for reading status
		readingStatus = userSeriesLabels.labels.filter((v) => v.id <= 10).at(0)?.label as ReadingStatus;
	}

	async function getUserListSeriesForm() {
		const selectedCustLabels = user ? await getUserSeriesLabelsForSeries(user.id, id) : [];
		if (userSeriesLabels) {
			return await superValidate(
				{
					labels: userSeriesLabels.labels,
					type: formType,
					readingStatus,
					formats: userSeriesLabels.formats.map((v) => v.format),
					langs: userSeriesLabels.langs.map((v) => v.lang),
					show_upcoming: userSeriesLabels.show_upcoming,
					volumes_read: userSeriesLabels.volumes_read,
					notes: userSeriesLabels.notes,
					started: userSeriesLabels.started,
					finished: userSeriesLabels.finished,
					score: userSeriesLabels.score,
					selectedCustLabels: selectedCustLabels.map((v) => v.id),
				},
				zod(userListSeriesSchema),
				{
					errors: false,
				},
			);
		}
		if (user?.id) {
			const series_settings = (await new DBUsers(db).getListPrefs(user.id)).default_series_settings;
			return await superValidate(series_settings, zod(userListSeriesSchema), {
				errors: false,
			});
		}
		return await superValidate(zod(userListSeriesSchema), {
			errors: false,
		});
	}

	const allCustLabels = user ? await getUserSeriesLabels(user.id, false) : [];
	const userListSeriesForm = await getUserListSeriesForm();

	return {
		series,
		userListSeriesForm,
		allCustLabels,
	};
};
