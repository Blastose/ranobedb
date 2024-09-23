import {
	generateBookEditionChangeStringFromEditions,
	generateBookStaffChangeStringFromStaffs,
	generateBookTitleChangeStringFromBooks,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type BookStaff,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { BookEdit } from './books';

export function getBookDiffs(params: {
	prevBookHistEdit: BookEdit;
	bookHistEdit: BookEdit;
	displayPrefs: DisplayPrefs;
}) {
	const { prevBookHistEdit, bookHistEdit, displayPrefs } = params;
	const diffs: Diff[] = [];

	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateBookTitleChangeStringFromBooks(prevBookHistEdit['titles']),
			lines2: generateBookTitleChangeStringFromBooks(bookHistEdit['titles']),
			name: 'Title(s)',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevBookHistEdit.hidden.toString(),
			words2: bookHistEdit.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevBookHistEdit.locked.toString(),
			words2: bookHistEdit.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Original language',
			words1: prevBookHistEdit.olang,
			words2: bookHistEdit.olang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateBookEditionChangeStringFromEditions(prevBookHistEdit['editions']),
			lines2: generateBookEditionChangeStringFromEditions(bookHistEdit['editions']),
			name: 'Editions',
		}),
	);
	const prevHistStaff: BookStaff[] = [];
	for (const ed of prevBookHistEdit['editions']) {
		for (const staff of ed.staff) {
			prevHistStaff.push({
				edition_name: ed.title,
				name: staff.name,
				note: staff.note,
				role_type: staff.role_type,
				romaji: staff.romaji,
				staff_id: staff.staff_id,
			});
		}
	}
	const currentHistStaff: BookStaff[] = [];
	for (const ed of bookHistEdit['editions']) {
		for (const staff of ed.staff) {
			currentHistStaff.push({
				edition_name: ed.title,
				name: staff.name,
				note: staff.note,
				role_type: staff.role_type,
				romaji: staff.romaji,
				staff_id: staff.staff_id,
			});
		}
	}
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateBookStaffChangeStringFromStaffs(prevHistStaff, displayPrefs.names),
			lines2: generateBookStaffChangeStringFromStaffs(currentHistStaff, displayPrefs.names),
			name: 'Staff',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Description',
			words1: prevBookHistEdit.description,
			words2: bookHistEdit.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Description (Japanese)',
			words1: prevBookHistEdit.description_ja,
			words2: bookHistEdit.description_ja,
		}),
	);
	return diffs;
}
