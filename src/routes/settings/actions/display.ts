import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import {
	displayPrefsSchema,
	homeDisplaySettingsSchema,
	privacySettingsSchema,
} from '$lib/server/zod/schema.js';
import type { RequestEvent } from '../$types';

export const displayprefs = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) return fail(401);

	const displayPrefsForm = await superValidate(request, zod4(displayPrefsSchema));
	if (!displayPrefsForm.valid) {
		return message(displayPrefsForm, { type: 'error', text: 'Error' }, { status: 400 });
	}

	const dbUsers = new DBUsers(db);
	await dbUsers.updateDisplayPrefs({
		userId: locals.user.id,
		displayPrefs: displayPrefsForm.data,
	});

	return message(displayPrefsForm, { text: 'Updated display preferences!', type: 'success' });
};

export const homedisplaysettings = async (event: RequestEvent) => {
	const { locals, request } = event;
	const user = locals.user;
	if (!user) {
		return fail(401);
	}

	const formData = await request.formData();

	const homeDisplaySettingsForm = await superValidate(formData, zod4(homeDisplaySettingsSchema));

	if (!homeDisplaySettingsForm.valid) {
		return message(
			homeDisplaySettingsForm,
			{ type: 'error', text: 'Invalid options' },
			{ status: 400 },
		);
	}
	await db
		.updateTable('auth_user')
		.set('home_display_settings', JSON.stringify(homeDisplaySettingsForm.data))
		.where('auth_user.id', '=', user.id)
		.execute();

	return message(homeDisplaySettingsForm, {
		text: 'Updated home display preferences successfully!',
		type: 'success',
	});
};

export const privacysettings = async (event: RequestEvent) => {
	const { locals, request } = event;
	const user = locals.user;
	if (!user) {
		return fail(401);
	}
	const formData = await request.formData();

	const privacySettingsForm = await superValidate(formData, zod4(privacySettingsSchema));

	if (!privacySettingsForm.valid) {
		return message(
			privacySettingsForm,
			{ type: 'error', text: 'Invalid options' },
			{ status: 400 },
		);
	}
	await db
		.updateTable('auth_user')
		.set('private', privacySettingsForm.data.private)
		.where('auth_user.id', '=', user.id)
		.execute();

	return message(privacySettingsForm, {
		text: 'Updated privacy settings successfully!',
		type: 'success',
	});
};
