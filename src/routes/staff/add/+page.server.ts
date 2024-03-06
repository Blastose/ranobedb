import { staffSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasAddPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { addStaff } from '$lib/server/db/staff/actions.js';

export const load = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	if (!hasAddPerms(locals.user)) {
		error(403);
	}

	const form = await superValidate(
		{
			aliases: [
				{
					main_alias: true,
					name: ''
				}
			]
		},
		zod(staffSchema),
		{
			errors: false
		}
	);

	return { form };
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(staffSchema));
		if (!hasAddPerms(locals.user)) {
			return fail(403, { form });
		}

		console.dir(form, { depth: null });

		if (!form.valid) {
			return fail(400, { form });
		}

		let success = false;
		let insertedStaffId;
		try {
			insertedStaffId = await addStaff({ staff: form.data }, locals.user);
			success = true;
		} catch (e) {
			if (e instanceof DatabaseError) {
				//
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			}
			console.log(e);
		}

		if (success) {
			flashRedirect(
				303,
				`/staff/${insertedStaffId}`,
				{ type: 'success', message: 'Successfully added staff!' },
				cookies
			);
		}
		return fail(400, { form });
	}
};
