import { revisionSchema, staffSchema } from '$lib/server/zod/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { superValidate } from 'sveltekit-superforms';

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

	const form = await superValidate({ ...staff }, zod(staffSchema), {
		errors: false,
	});

	return { staff, form };
};
