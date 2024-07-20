import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import type { ReadingStatus } from '$lib/server/db/dbTypes.js';
import { DBSeries } from '$lib/server/db/series/series.js';
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

	await new DBChanges(db).itemHiddenError({
		item: series,
		itemId: id,
		itemName: 'series',
		title: getTitleDisplay({ obj: series, prefs: getDisplayPrefsUser(locals.user).title_prefs }),
		user: locals.user,
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
					.whereRef('user_list_series_label.user_id', '=', 'user_list_series.user_id'),
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
		.where('user_list_series.user_id', '=', locals.user?.id || '')
		.where('user_list_series.series_id', '=', id)
		.select(['user_list_series.series_id'])
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
	const userListSeriesForm = await superValidate(
		{
			labels: userSeriesLabels?.labels,
			type: formType,
			readingStatus,
			formats: userSeriesLabels?.formats.map((v) => v.format),
			langs: userSeriesLabels?.langs.map((v) => v.lang),
		},
		zod(userListSeriesSchema),
		{
			errors: false,
		},
	);

	return {
		series,
		userListSeriesForm,
	};
};
