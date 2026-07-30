import { error, json, type RequestHandler } from '@sveltejs/kit';
import { userListSeriesSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { DBSeriesListActions } from '$lib/server/db/user/series-list';
import { db } from '$lib/server/db/db';
import {
	defaultUserListLabelsArray,
	defaultUserListLabelsMap,
	languagesArray,
	releaseFormatArray,
} from '$lib/db/dbConsts';

const maxNumberValue = 2147483647;

const apiUserListSeriesSchema = userListSeriesSchema
	.extend({
		seriesId: z.number(),
		formats: z.array(z.enum(releaseFormatArray)).default([]),
		langs: z.array(z.enum(languagesArray)).default(['en']),
		readingStatus: z.enum(defaultUserListLabelsArray).default('Reading'),
		selectedCustLabels: z.array(z.number().min(11).max(maxNumberValue)).max(2000).default([]),
	})
	.omit({
		type: true,

		// from my understanding this is omittable
		labels: true,
	});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const user = locals.user;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}

	const validatedBody = apiUserListSeriesSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json({ error: z.treeifyError(validatedBody.error) }, { status: 400 });
	}

	const data = validatedBody.data;

	const [existingUserSeries, userCustLabels] = await Promise.all([
		db
			.selectFrom('user_list_series')
			.select('series_id')
			.where('user_id', '=', user.id)
			.where('series_id', '=', data.seriesId)
			.executeTakeFirst(),
		db
			.selectFrom('user_list_label')
			.select('id')
			.where('user_id', '=', user.id)
			.where('id', '>', 10)
			.execute(),
	]);

	if (existingUserSeries) {
		return error(400, 'Series is already in list');
	}

	const userCustLabelIds = new Set(userCustLabels.map((l) => l.id));

	const invalidLabelIds = data.selectedCustLabels.filter((id) => !userCustLabelIds.has(id));

	if (invalidLabelIds.length > 0) {
		return error(400, `Invalid or non-existent custom label ID(s): ${invalidLabelIds.join(', ')}`);
	}

	const readingStatusId = defaultUserListLabelsMap.get(data.readingStatus) ?? 1;
	const dbSeriesListActions = new DBSeriesListActions(db);

	await dbSeriesListActions.addSeriesToList({
		trx: undefined,
		series_id: data.seriesId,
		user_id: user.id,
		labelIds: [],
		readingStatusId,
		langs: data.langs,
		formats: data.formats,
		selectedCustLabels: data.selectedCustLabels,
		show_upcoming: data.show_upcoming,
		volumes_read: data.volumes_read,
		notes: data.notes ?? '',
		started: data.started || null,
		finished: data.finished || null,
		score: data.score ? data.score * 10 : data.score,
		notify_book: data.notify_book,
		notify_when_released: data.notify_when_released,
	});

	return json({ success: true });
};
