import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';

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
		publisher_id: parseInt(params.id),
	};
}

async function favoriteUserPublisher(event: RequestEvent) {
	const { user, publisher_id } = await validateRequest(event);

	if (
		await db.selectFrom('publisher').where('publisher.id', '=', publisher_id).executeTakeFirst()
	) {
		db.insertInto('user_list_publisher')
			.values({
				publisher_id,
				user_id: user.id,
			})
			.onConflict((oc) => oc.doNothing())
			.execute();
	} else {
		return error(400, 'Publisher does not exist');
	}

	return json({ success: true });
}

async function unfavoriteUserPublisher(event: RequestEvent) {
	const { user, publisher_id } = await validateRequest(event);
	const existingUserSeries = await db
		.selectFrom('user_list_publisher')
		.select('publisher_id')
		.where('user_id', '=', user.id)
		.where('publisher_id', '=', publisher_id)
		.executeTakeFirst();

	if (!existingUserSeries) {
		error(400, 'Publisher is not favorited');
	}

	await db
		.deleteFrom('user_list_publisher')
		.where('publisher_id', '=', publisher_id)
		.where('user_id', '=', user.id)
		.execute();

	return json({ success: true });
}

export const PUT: RequestHandler = favoriteUserPublisher;
export const DELETE: RequestHandler = unfavoriteUserPublisher;
