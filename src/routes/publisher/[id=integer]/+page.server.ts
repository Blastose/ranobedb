import { getDisplayPrefsUser, getNameDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import {
	pageSchema,
	publisherTabsSchema,
	userListPublisherSchema,
	type UserListFormType,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const svTab = await superValidate(url, zod4(publisherTabsSchema));

	const tab = svTab.data.tab;
	const id = Number(params.id);

	const dbPublishers = DBPublishers.fromDB(db, locals.user);

	const publisherPromise = dbPublishers.getPublisher(id).executeTakeFirst();
	const worksPromise = dbPublishers.getWorksPaged({
		id,
		currentPage,
		tab,
		userId: locals.user?.id,
	});

	const [publisher, { count, totalPages, works }] = await Promise.all([
		publisherPromise,
		worksPromise,
	]);

	if (!publisher) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: publisher,
		itemId: id,
		itemName: 'publisher',
		title: getNameDisplay({ obj: publisher, prefs: getDisplayPrefsUser(locals.user).names }),
		user: locals.user,
	});

	let formType: UserListFormType;
	const userPublisher = locals.user
		? await db
				.selectFrom('user_list_publisher')
				.where('user_list_publisher.user_id', '=', locals.user.id)
				.where('user_list_publisher.publisher_id', '=', id)
				.executeTakeFirst()
		: undefined;
	if (userPublisher) {
		formType = 'delete';
	} else {
		formType = 'add';
	}

	const userListPublisherForm = await superValidate(
		{
			type: formType,
		},
		zod4(userListPublisherSchema),
	);

	return { publisher, works, count, currentPage, totalPages, userListPublisherForm };
};
