import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { userListSeriesSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { db } from '$lib/server/db/db';
import { defaultUserListLabelsMap } from '$lib/db/dbConsts';
import { DBSeriesListActions } from '$lib/server/db/user/series-list';

const apiUserListSeriesSchema = userListSeriesSchema.omit({
	type: true,
	// from my understanding this is omittable
	labels: true,
});

async function validateRequest(event: RequestEvent) {
	const { params, locals } = event;

	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	if (!params.id) {
		error(400, 'No ID specified');
	}

	return {
		user: locals.user,
		series_id: parseInt(params.id),
	};
}

async function addOrEditUserListSeries(event: RequestEvent) {
	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const validatedBody = apiUserListSeriesSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json(z.treeifyError(validatedBody.error), { status: 400 });
	}

	const data = validatedBody.data;
	const { user, series_id } = await validateRequest(event);

	const [existingUserSeries, userCustLabels] = await Promise.all([
		db
			.selectFrom('user_list_series')
			.select('series_id')
			.where('user_id', '=', user.id)
			.where('series_id', '=', series_id)
			.executeTakeFirst(),
		db
			.selectFrom('user_list_label')
			.select('id')
			.where('user_id', '=', user.id)
			.where('id', '>', 10)
			.execute(),
	]);

	const userCustLabelIds = new Set(userCustLabels.map((l) => l.id));

	const invalidLabelIds = data.selectedCustLabels.filter((id) => !userCustLabelIds.has(id));

	if (invalidLabelIds.length > 0) {
		error(400, `Invalid or non-existent custom label ID(s): ${invalidLabelIds.join(', ')}`);
	}

	const readingStatusId = defaultUserListLabelsMap.get(data.readingStatus) ?? 1;
	const dbSeriesListActions = new DBSeriesListActions(db);
	if (!existingUserSeries) {
		await dbSeriesListActions.addSeriesToList({
			trx: undefined,
			series_id,
			user_id: user.id,
			labelIds: [],
			readingStatusId,
			selectedCustLabels: data.selectedCustLabels,
			langs: data.langs,
			formats: data.formats,
			show_upcoming: data.show_upcoming,
			notify_book: data.notify_book,
			notify_when_released: data.notify_when_released,
			volumes_read: data.volumes_read,
			notes: data.notes ?? '',
			started: data.started || null,
			finished: data.finished || null,
			score: data.score ? data.score * 10 : data.score,
		});
	} else {
		await dbSeriesListActions.editSeriesInList({
			series_id,
			user_id: user.id,
			labelIds: [],
			readingStatusId,
			selectedCustLabels: data.selectedCustLabels,
			langs: data.langs,
			formats: data.formats,
			show_upcoming: data.show_upcoming,
			notify_book: data.notify_book,
			notify_when_released: data.notify_when_released,
			volumes_read: data.volumes_read,
			notes: data.notes ?? '',
			started: data.started || null,
			finished: data.finished || null,
			score: data.score ? data.score * 10 : data.score,
		});
	}
	return json({ success: true, action: existingUserSeries ? 'edit' : 'add' });
}

async function deleteUserSeries(event: RequestEvent) {
	const { user, series_id } = await validateRequest(event);
	const existingUserSeries = await db
		.selectFrom('user_list_series')
		.select('series_id')
		.where('user_id', '=', user.id)
		.where('series_id', '=', series_id)
		.executeTakeFirst();

	if (!existingUserSeries) {
		error(400, 'Series is not in the list');
	}

	const dbSeriesListAction = new DBSeriesListActions(db);
	await dbSeriesListAction.removeSeriesFromList({
		series_id,
		user_id: user.id,
		remove_all: true,
	});

	return json({ success: true });
}

export const PUT: RequestHandler = addOrEditUserListSeries;
export const DELETE: RequestHandler = deleteUserSeries;
