import { getDisplayPrefsUser, getNameDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import type { Language, ReleaseFormat } from '$lib/server/db/dbTypes.js';
import { DBStaff, type StaffWorks } from '$lib/server/db/staff/staff';
import { DBUsers } from '$lib/server/db/user/user';
import {
	pageSchema,
	staffTabsSchema,
	userListStaffSchema,
	type UserListFormType,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const svTab = await superValidate(url, zod4(staffTabsSchema));
	const tab = svTab.data.tab;
	const id = Number(params.id);

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(id).executeTakeFirst();
	if (!staff) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: staff,
		itemId: id,
		itemName: 'staff',
		title: getNameDisplay({ obj: staff, prefs: getDisplayPrefsUser(locals.user).names }),
		user: locals.user,
	});

	const userStaff = await db
		.selectFrom('user_list_staff')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('user_list_staff_lang')
					.select(['user_list_staff_lang.lang'])
					.whereRef('user_list_staff_lang.staff_id', '=', 'user_list_staff.staff_id')
					.whereRef('user_list_staff_lang.user_id', '=', 'user_list_staff.user_id'),
			).as('langs'),
			jsonArrayFrom(
				eb
					.selectFrom('user_list_staff_format')
					.select(['user_list_staff_format.format'])
					.whereRef('user_list_staff_format.staff_id', '=', 'user_list_staff.staff_id')
					.whereRef('user_list_staff_format.user_id', '=', 'user_list_staff.user_id'),
			).as('formats'),
		])
		.where('user_list_staff.user_id', '=', locals.user?.id || '')
		.where('user_list_staff.staff_id', '=', id)
		.select([
			'user_list_staff.staff_id',
			'user_list_staff.show_upcoming',
			'user_list_staff.notify_book',
			'user_list_staff.only_first_book',
		])
		.executeTakeFirst();
	let formType: UserListFormType;
	if (userStaff) {
		formType = 'update';
	} else {
		formType = 'add';
	}

	const { count, totalPages, works } = await dbStaff.getWorksPaged({
		id: id,
		currentPage,
		tab,
		userId: locals.user?.id,
	});

	const series_settings = locals.user?.id
		? (await new DBUsers(db).getListPrefs(locals.user.id)).default_series_settings
		: {
				langs: [] as Language[],
				formats: [] as ReleaseFormat[],
			};
	const userListStaffForm = await superValidate(
		{
			formats: userStaff ? userStaff?.formats.map((v) => v.format) : series_settings.formats,
			langs: userStaff ? userStaff?.langs.map((v) => v.lang) : series_settings.langs,
			show_upcoming: userStaff?.show_upcoming,
			notify_book: userStaff?.notify_book,
			only_first_book: userStaff?.only_first_book,
			type: formType,
		},
		zod4(userListStaffSchema),
	);

	return { staff, works, count, currentPage, totalPages, userListStaffForm };
};
