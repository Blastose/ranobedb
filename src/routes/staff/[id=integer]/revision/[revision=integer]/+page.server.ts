import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { db } from '$lib/server/db/db.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { staffTabsSchema } from '$lib/server/zod/schema.js';
import { type Diff } from '$lib/components/history/utils.js';
import { getStaffDiffs } from '$lib/server/db/staff/diff.js';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const id = params.id;
	const svTab = await superValidate(url, zod(staffTabsSchema));
	const tab = svTab.data.tab;
	const staffId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staffPromise = dbStaff
		.getStaffHistOne({ id: staffId, revision: revision })
		.executeTakeFirst();
	const changesPromise = getChanges('staff', staffId, [
		previousRevision,
		revision,
		revision + 1,
	]).execute();

	const [staff, changes] = await Promise.all([staffPromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!staff) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(staff);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/staff/${staffId}`);
		}
	}
	let diffs: Diff[] = [];
	if (previousRevision > 0) {
		const [prevStaffHistEdit, staffHistEdit] = await Promise.all([
			dbStaff
				.getStaffHistOneEdit({
					id: staffId,
					revision: previousRevision,
				})
				.executeTakeFirst(),
			dbStaff.getStaffHistOneEdit({ id: staffId, revision }).executeTakeFirst(),
		]);
		if (!prevStaffHistEdit || !staffHistEdit) {
			error(404);
		}
		diffs = getStaffDiffs({ prevStaffHistEdit, staffHistEdit });
	}

	const { count, totalPages, works } = await dbStaff.getWorksPaged({
		id: staffId,
		currentPage,
		tab,
	});
	return {
		staffId,
		staff,
		works,
		diffs,
		count,
		currentPage,
		totalPages,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
