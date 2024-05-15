import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { detailedDiff } from 'deep-object-diff';
import {
	getCurrentVisibilityStatus,
	paginationBuilderExecuteWithCount,
} from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { db } from '$lib/server/db/db.js';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const id = params.id;
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
	let diff;
	if (previousRevision > 0) {
		const prevStaff = await dbStaff
			.getStaffHistOne({
				id: staffId,
				revision: previousRevision,
			})
			.executeTakeFirst();
		if (!prevStaff) {
			error(404);
		}
		// TODO diff these better
		diff = detailedDiff(prevStaff, staff);
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(dbStaff.getBooksBelongingToStaff(staffId), {
		limit: 40,
		page: currentPage,
	});

	return {
		staffId,
		staff,
		books,
		diff,
		count,
		currentPage,
		totalPages,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
