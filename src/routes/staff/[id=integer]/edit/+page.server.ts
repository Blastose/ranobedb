import { revisionSchema, staffSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { getStaffHistOneEdit, getStaffOneEdit } from '$lib/server/db/staff/staff.js';
import { editStaff } from '$lib/server/db/staff/actions.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const id = params.id;
	const staffId = Number(id);
	let staff;

	const revision = await superValidate(url, zod(revisionSchema));
	// We need to check if the url search params contains `revision`
	// because the .valid property will be false if it doesn't,
	// but that's find since we'll just use the "current" revision
	if (revision.valid && url.searchParams.get('revision')) {
		staff = await getStaffHistOneEdit({
			id: staffId,
			revision: revision.data.revision
		}).executeTakeFirst();
	} else {
		staff = await getStaffOneEdit(staffId).executeTakeFirst();
	}

	if (!staff) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(staff);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}
	if (!hasEditPerms(locals.user)) {
		error(403);
	}

	const prefilledComment =
		revision.valid && url.searchParams.get('revision')
			? `Reverted to revision ${revision.data.revision}`
			: undefined;

	const form = await superValidate({ ...staff, comment: prefilledComment }, zod(staffSchema), {
		errors: false
	});

	return { staff, form };
};

export const actions = {
	default: async ({ request, locals, params, cookies }) => {
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(staffSchema));
		if (!hasEditPerms(locals.user)) {
			return fail(403, { form });
		}

		console.dir(form, { depth: null });

		if (!form.valid) {
			return fail(400, { form });
		}

		let success = false;
		try {
			await editStaff({ staff: form.data, id }, locals.user);
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
				`/staff/${id}`,
				{ type: 'success', message: 'Successfully edited staff!' },
				cookies
			);
		}
		return fail(400, { form });
	}
};
