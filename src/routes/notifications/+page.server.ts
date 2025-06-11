import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { Notifications } from '$lib/server/db/notifications/notifications.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}
	const page = await superValidate(url, zod4(pageSchema));
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
