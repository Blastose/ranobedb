import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { behaviorSettingsSchema } from '$lib/server/zod/schema.js';
import type { RequestEvent } from '../$types';

export const behaviorprefs = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		return fail(401);
	}

	const behaviorPrefsForm = await superValidate(request, zod4(behaviorSettingsSchema));
	if (!behaviorPrefsForm.valid) {
		return message(behaviorPrefsForm, { type: 'error', text: 'Error' }, { status: 400 });
	}

	const dbUsers = new DBUsers(db);
	await dbUsers.updateBehaviorSettings({
		userId: locals.user.id,
		behaviorSettings: behaviorPrefsForm.data,
	});

	return message(behaviorPrefsForm, { text: 'Updated behavior preferences!', type: 'success' });
};
