import {
	generateStaffAliasChangeStringFromStaffAliases,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { StaffEdit } from './staff';

export function getStaffDiffs(params: { prevStaffHistEdit: StaffEdit; staffHistEdit: StaffEdit }) {
	const { prevStaffHistEdit, staffHistEdit } = params;
	const diffs: Diff[] = [];
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateStaffAliasChangeStringFromStaffAliases(prevStaffHistEdit['aliases']),
			lines2: generateStaffAliasChangeStringFromStaffAliases(staffHistEdit['aliases']),
			name: 'Names',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevStaffHistEdit.hidden.toString(),
			words2: staffHistEdit.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevStaffHistEdit.locked.toString(),
			words2: staffHistEdit.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Description',
			words1: prevStaffHistEdit.description,
			words2: staffHistEdit.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Bookwalker',
			words1: prevStaffHistEdit.bookwalker_id?.toString(),
			words2: staffHistEdit.bookwalker_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Wikidata',
			words1: prevStaffHistEdit.wikidata_id?.toString(),
			words2: staffHistEdit.wikidata_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Syosetu',
			words1: prevStaffHistEdit.syosetu_id?.toString(),
			words2: staffHistEdit.syosetu_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Kakuyomu',
			words1: prevStaffHistEdit.kakuyomu_id,
			words2: staffHistEdit.kakuyomu_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Twitter',
			words1: prevStaffHistEdit.twitter_id,
			words2: staffHistEdit.twitter_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Pixiv',
			words1: prevStaffHistEdit.pixiv_id?.toString(),
			words2: staffHistEdit.pixiv_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevStaffHistEdit.website,
			words2: staffHistEdit.website,
		}),
	);

	return diffs;
}
