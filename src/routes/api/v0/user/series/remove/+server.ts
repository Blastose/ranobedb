import { error, json, type RequestHandler } from '@sveltejs/kit';
import * as z from 'zod';
import { DBSeriesListActions } from '$lib/server/db/user/series-list';
import { db } from '$lib/server/db/db';

const apiUserRemoveSeriesSchema = z.object({
	seriesId: z.number(),
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

	const validatedBody = apiUserRemoveSeriesSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json({ error: z.treeifyError(validatedBody.error) }, { status: 400 });
	}

	const data = validatedBody.data;

	const existingUserSeries = await db
		.selectFrom('user_list_series')
		.select('series_id')
		.where('user_id', '=', user.id)
		.where('series_id', '=', data.seriesId)
		.executeTakeFirst();

	if (!existingUserSeries) {
		return error(400, 'Series is not in the list');
	}

	const dbSeriesListActions = new DBSeriesListActions(db);
	await dbSeriesListActions.removeSeriesFromList({
		series_id: data.seriesId,
		user_id: user.id,
		remove_all: true,
	});

	return json({ success: true });
};
