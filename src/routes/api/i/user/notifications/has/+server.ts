import { db } from '$lib/server/db/db';
import { Notifications } from '$lib/server/db/notifications/notifications';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return error(401);
	}

	const notif = new Notifications(db);
	const hasNotifs = await notif.hasNotifications(user.id);

	return json(hasNotifs);
};
