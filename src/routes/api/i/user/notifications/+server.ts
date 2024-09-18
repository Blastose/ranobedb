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
	const notifications = await notif.getNotifications(user.id);

	return json(notifications);
};

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return error(401);
	}

	await db
		.updateTable('notification')
		.set({
			is_read: true,
		})
		.where('is_read', '=', false)
		.where('notification.user_id', '=', user.id)
		.execute();

	return json({
		success: true,
	});
};
