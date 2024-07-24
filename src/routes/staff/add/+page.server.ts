import { staffSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasAddPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { DBStaffActions } from '$lib/server/db/staff/actions.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { dbItemActionsLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	if (!hasAddPerms(locals.user)) {
		error(403, { missingPerm: 'add' });
	}

	const form = await superValidate(
		{
			aliases: [
				{
					main_alias: true,
					name: '',
				},
			],
		},
		zod(staffSchema),
		{
			errors: false,
		},
	);

	return { form };
};

export const actions = {
	default: async (event) => {
		const { request, locals, cookies } = event;
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(staffSchema));

		if (!hasAddPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		if (await isLimited(dbItemActionsLimiter, event)) {
			return message(
				form,
				{ type: 'error', text: 'Too many attempts; Please wait 10 seconds' },
				{ status: 429 },
			);
		}

		let success = false;
		let insertedStaffId;
		const dbStaffActions = DBStaffActions.fromDB(db);
		try {
			insertedStaffId = await dbStaffActions.addStaff({ staff: form.data }, locals.user);
			success = true;
		} catch (e) {
			if (e instanceof DatabaseError) {
				console.log(e);
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			}
		}

		if (success) {
			flashRedirect(
				303,
				`/staff/${insertedStaffId}`,
				{ type: 'success', message: 'Successfully added staff!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
