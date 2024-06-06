import {
	generatePublisherRelChangeStringFromPublishers,
	getDiffChars,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { PublisherEdit } from './publishers';

export function getPublisherDiffs(params: {
	prevPublisherHistEdit: PublisherEdit;
	publisherHistEdit: PublisherEdit;
	displayPrefs: DisplayPrefs;
}) {
	const { prevPublisherHistEdit, publisherHistEdit, displayPrefs } = params;
	const diffs: Diff[] = [];
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Name',
			words1: prevPublisherHistEdit.name,
			words2: publisherHistEdit.name,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Romaji',
			words1: prevPublisherHistEdit.romaji,
			words2: publisherHistEdit.romaji,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Biography',
			words1: prevPublisherHistEdit.description,
			words2: publisherHistEdit.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Series relations',
			lines1: generatePublisherRelChangeStringFromPublishers(
				prevPublisherHistEdit['child_publishers'],
				displayPrefs.names,
			),
			lines2: generatePublisherRelChangeStringFromPublishers(
				publisherHistEdit['child_publishers'],
				displayPrefs.names,
			),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevPublisherHistEdit.hidden.toString(),
			words2: publisherHistEdit.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevPublisherHistEdit.locked.toString(),
			words2: publisherHistEdit.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Bookwalker',
			words1: prevPublisherHistEdit.bookwalker,
			words2: publisherHistEdit.bookwalker,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Wikidata',
			words1: prevPublisherHistEdit.wikidata_id?.toString(),
			words2: publisherHistEdit.wikidata_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Twitter',
			words1: prevPublisherHistEdit.twitter_id,
			words2: publisherHistEdit.twitter_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevPublisherHistEdit.website,
			words2: publisherHistEdit.website,
		}),
	);

	return diffs;
}
