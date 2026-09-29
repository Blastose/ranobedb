import {
	generateStaffAliasChangeStringFromStaffAliases,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { StaffHistFull } from './staff';

export function getStaffDiffs(params: {
	prevStaffHistFull: StaffHistFull;
	staffHistFull: StaffHistFull;
}) {
	const { prevStaffHistFull, staffHistFull } = params;
	const diffs: Diff[] = [];
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateStaffAliasChangeStringFromStaffAliases(prevStaffHistFull['aliases']),
			lines2: generateStaffAliasChangeStringFromStaffAliases(staffHistFull['aliases']),
			name: 'Names',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Primary language',
			words1: prevStaffHistFull.lang,
			words2: staffHistFull.lang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevStaffHistFull.hidden.toString(),
			words2: staffHistFull.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevStaffHistFull.locked.toString(),
			words2: staffHistFull.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Description',
			words1: prevStaffHistFull.description,
			words2: staffHistFull.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'BookWalker',
			words1: prevStaffHistFull.bookwalker_id?.toString(),
			words2: staffHistFull.bookwalker_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'BookWalker Global ID (legacy, no longer used)',
			words1: prevStaffHistFull.legacy_bookwalker_gl_id?.toString(),
			words2: staffHistFull.legacy_bookwalker_gl_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'BookWalker Global',
			words1: prevStaffHistFull.bookwalker_gl_con_id,
			words2: staffHistFull.bookwalker_gl_con_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Wikidata',
			words1: prevStaffHistFull.wikidata_id?.toString(),
			words2: staffHistFull.wikidata_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Syosetu',
			words1: prevStaffHistFull.syosetu_id?.toString(),
			words2: staffHistFull.syosetu_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Kakuyomu',
			words1: prevStaffHistFull.kakuyomu_id,
			words2: staffHistFull.kakuyomu_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Twitter',
			words1: prevStaffHistFull.twitter_id,
			words2: staffHistFull.twitter_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Bluesky',
			words1: prevStaffHistFull.bsky_id,
			words2: staffHistFull.bsky_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Pixiv',
			words1: prevStaffHistFull.pixiv_id?.toString(),
			words2: staffHistFull.pixiv_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevStaffHistFull.website,
			words2: staffHistFull.website,
		}),
	);

	return diffs;
}
