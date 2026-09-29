import {
	generateBookEditionChangeStringFromEditions,
	generateBookStaffChangeStringFromStaffs,
	getDiffLines,
	getDiffTitle,
	getDiffWords,
	pushIfNotUndefined,
	type BookStaff,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { BookHistFull } from './books';

export function getBookDiffs(params: {
	prevBookHistFull: BookHistFull;
	bookHistFull: BookHistFull;
	displayPrefs: DisplayPrefs;
}) {
	const { prevBookHistFull, bookHistFull, displayPrefs } = params;
	const diffs: Diff[] = [];

	pushIfNotUndefined(
		diffs,
		getDiffTitle({
			name: 'Title(s)',
			title1: prevBookHistFull['titles'],
			title2: bookHistFull['titles'],
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevBookHistFull.hidden.toString(),
			words2: bookHistFull.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevBookHistFull.locked.toString(),
			words2: bookHistFull.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Original language',
			words1: prevBookHistFull.olang,
			words2: bookHistFull.olang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateBookEditionChangeStringFromEditions(prevBookHistFull['editions']),
			lines2: generateBookEditionChangeStringFromEditions(bookHistFull['editions']),
			name: 'Editions',
		}),
	);
	const prevHistStaff: BookStaff[] = [];
	for (const ed of prevBookHistFull['editions']) {
		for (const staff of ed.staff) {
			prevHistStaff.push({
				edition_name: ed.title,
				name: staff.name,
				note: staff.note,
				role_type: staff.role_type,
				romaji: staff.romaji,
				staff_id: staff.staff_id,
				hidden: staff.hidden,
			});
		}
	}
	const currentHistStaff: BookStaff[] = [];
	for (const ed of bookHistFull['editions']) {
		for (const staff of ed.staff) {
			currentHistStaff.push({
				edition_name: ed.title,
				name: staff.name,
				note: staff.note,
				role_type: staff.role_type,
				romaji: staff.romaji,
				staff_id: staff.staff_id,
				hidden: staff.hidden,
			});
		}
	}
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			words1: prevBookHistFull.legacy_image_id?.toString(),
			words2: bookHistFull.legacy_image_id?.toString(),
			name: 'Image (legacy, no longer used)',
		}),
	);
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
			words1: prevBookHistFull.description,
			words2: bookHistFull.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Description (Japanese)',
			words1: prevBookHistFull.description_ja,
			words2: bookHistFull.description_ja,
		}),
	);
	return diffs;
}
