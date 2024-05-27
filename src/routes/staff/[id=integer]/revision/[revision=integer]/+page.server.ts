import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import {
	getCurrentVisibilityStatus,
	paginationBuilderExecuteWithCount,
} from '$lib/server/db/dbHelpers.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import { db } from '$lib/server/db/db.js';
import {
	generateStaffAliasChangeStringFromStaffAliases,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';

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
	const diffs: Diff[] = [];
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
		diff = getDiffLines({
			obj1: prevStaffHistEdit,
			obj2: staffHistEdit,
			key: 'aliases',
			fn: (v: (typeof staffHistEdit)['aliases']) =>
				generateStaffAliasChangeStringFromStaffAliases(v),
			name: 'Names',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Hidden',
			words1: prevStaffHistEdit.hidden.toString(),
			words2: staffHistEdit.hidden.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Locked',
			words1: prevStaffHistEdit.locked.toString(),
			words2: staffHistEdit.locked.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Description',
			words1: prevStaffHistEdit.description,
			words2: staffHistEdit.description,
		});
		pushIfNotUndefined(diffs, diff);
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(dbStaff.getBooksBelongingToStaff(staffId), {
		limit: 24,
		page: currentPage,
	});

	return {
		staffId,
		staff,
		books,
		diffs,
		count,
		currentPage,
		totalPages,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
