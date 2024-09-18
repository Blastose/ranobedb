import { db } from '$lib/server/db/db';
import { Notifications } from '$lib/server/db/notifications/notifications';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async ({ locals, url }) => {
	let notifications: Awaited<ReturnType<Notifications['getNotifications']>> = [];
	if (locals.user) {
		// TODO make notifications load when notifications menu open
		const dbNotifications = new Notifications(db);

		notifications = await dbNotifications.getNotifications(locals.user.id);
	}

	return {
		user: locals.user,
		url: url.pathname,
		theme: locals.theme,
		notifications,
	};
});
