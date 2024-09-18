import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { Notifications } from '$lib/server/db/notifications/notifications.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	const page = await superValidate(url, zod(pageSchema));
	const currentPage = page.data.page;
	const notif = new Notifications(db);
	const notificationsQuery = notif.getNotifications(locals.user.id);

	const {
		result: notifications,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(notificationsQuery, {
		limit: 20,
		page: currentPage,
	});

	return {
		notifications,
		count,
		totalPages,
		currentPage,
	};
};
