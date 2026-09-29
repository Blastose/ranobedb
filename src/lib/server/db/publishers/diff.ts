import {
	generatePublisherRelChangeStringFromPublishers,
	getDiffChars,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { PublisherHistFull } from './publishers';

export function getPublisherDiffs(params: {
	prevPublisherHistFull: PublisherHistFull;
	publisherHistFull: PublisherHistFull;
	displayPrefs: DisplayPrefs;
}) {
	const { prevPublisherHistFull, publisherHistFull, displayPrefs } = params;
	const diffs: Diff[] = [];
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Name',
			words1: prevPublisherHistFull.name,
			words2: publisherHistFull.name,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Romaji',
			words1: prevPublisherHistFull.romaji,
			words2: publisherHistFull.romaji,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Primary language',
			words1: prevPublisherHistFull.lang,
			words2: publisherHistFull.lang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Aliases',
			lines1: prevPublisherHistFull.aliases,
			lines2: publisherHistFull.aliases,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Biography',
			words1: prevPublisherHistFull.description,
			words2: publisherHistFull.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Publisher relations',
			lines1: generatePublisherRelChangeStringFromPublishers(
				prevPublisherHistFull['child_publishers'],
				displayPrefs.names,
			),
			lines2: generatePublisherRelChangeStringFromPublishers(
				publisherHistFull['child_publishers'],
				displayPrefs.names,
			),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevPublisherHistFull.hidden.toString(),
			words2: publisherHistFull.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevPublisherHistFull.locked.toString(),
			words2: publisherHistFull.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'BookWalker',
			words1: prevPublisherHistFull.bookwalker,
			words2: publisherHistFull.bookwalker,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Wikidata',
			words1: prevPublisherHistFull.wikidata_id?.toString(),
			words2: publisherHistFull.wikidata_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Twitter',
			words1: prevPublisherHistFull.twitter_id,
			words2: publisherHistFull.twitter_id,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevPublisherHistFull.website,
			words2: publisherHistFull.website,
		}),
	);

	return diffs;
}
