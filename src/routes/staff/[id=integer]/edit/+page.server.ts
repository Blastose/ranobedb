import { revisionSchema, staffSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { DBStaffActions } from '$lib/server/db/staff/actions.js';
import { revertedRevisionMarkdown } from '$lib/db/revision.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { dbItemActionsLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	const id = params.id;
	const staffId = Number(id);
	let staff;

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const revision = await superValidate(url, zod(revisionSchema));
	if (revision.valid && revision.data.revision) {
		staff = await dbStaff
			.getStaffHistOneEdit({
				id: staffId,
				revision: revision.data.revision,
			})
			.executeTakeFirst();
	} else {
		staff = await dbStaff.getStaffOneEdit(staffId).executeTakeFirst();
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

	const prefilledComment = revision.data.revision
		? revertedRevisionMarkdown('staff', staffId, revision.data.revision)
		: undefined;

	const form = await superValidate({ ...staff, comment: prefilledComment }, zod(staffSchema), {
		errors: false,
	});

	return { staff, form };
};

export const actions = {
	default: async (event) => {
		const { request, locals, params, cookies } = event;
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(staffSchema));
		if (!hasEditPerms(locals.user)) {
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
		const dbStaffActions = DBStaffActions.fromDB(db);
		try {
			await dbStaffActions.editStaff({ staff: form.data, id }, locals.user);
			success = true;
		} catch (e) {
			console.log(e);
			if (e instanceof DatabaseError) {
				return fail(400, { form });
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			}
		}

		if (success) {
			flashRedirect(
				303,
				`/staff/${id}`,
				{ type: 'success', message: 'Successfully edited staff!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
