import { formatDuration } from '$lib/utils/duration';
import { DateNumber } from '$lib/components/form/release/releaseDate';
import {
	generateReleaseBookChangeStringFromBooks,
	generateReleasePublisherChangeStringFromPublishers,
	getDiffChars,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { ReleaseHistFull } from './releases';

export function getReleaseDiffs(params: {
	prevReleaseHistFull: ReleaseHistFull;
	releaseHistFull: ReleaseHistFull;
	displayPrefs: DisplayPrefs;
}) {
	const { prevReleaseHistFull, releaseHistFull, displayPrefs } = params;
	const diffs: Diff[] = [];
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Title',
			words1: prevReleaseHistFull.title,
			words2: releaseHistFull.title,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Romaji',
			words1: prevReleaseHistFull.romaji,
			words2: releaseHistFull.romaji,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateReleaseBookChangeStringFromBooks(
				prevReleaseHistFull['books'],
				displayPrefs.title_prefs,
			),
			lines2: generateReleaseBookChangeStringFromBooks(
				releaseHistFull['books'],
				displayPrefs.title_prefs,
			),
			name: 'Books',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateReleasePublisherChangeStringFromPublishers(
				prevReleaseHistFull['publishers'],
				displayPrefs.names,
			),
			lines2: generateReleasePublisherChangeStringFromPublishers(
				releaseHistFull['publishers'],
				displayPrefs.names,
			),
			name: 'Publishers',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevReleaseHistFull.hidden.toString(),
			words2: releaseHistFull.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevReleaseHistFull.locked.toString(),
			words2: releaseHistFull.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Image',
			words1: prevReleaseHistFull.image_id?.toString(),
			words2: releaseHistFull.image_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Format',
			words1: prevReleaseHistFull.format,
			words2: releaseHistFull.format,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'ISBN13',
			words1: prevReleaseHistFull.isbn13,
			words2: releaseHistFull.isbn13,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Language',
			words1: prevReleaseHistFull.lang,
			words2: releaseHistFull.lang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Pages',
			words1: prevReleaseHistFull.pages?.toString(),
			words2: releaseHistFull.pages?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Duration',
			words1: formatDuration(prevReleaseHistFull.duration),
			words2: formatDuration(releaseHistFull.duration),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Release date',
			words1: new DateNumber(prevReleaseHistFull.release_date).getDateFormatted(),
			words2: new DateNumber(releaseHistFull.release_date).getDateFormatted(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Note',
			words1: prevReleaseHistFull.description,
			words2: releaseHistFull.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevReleaseHistFull.website,
			words2: releaseHistFull.website,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Amazon',
			words1: prevReleaseHistFull.amazon,
			words2: releaseHistFull.amazon,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'BookWalker',
			words1: prevReleaseHistFull.bookwalker,
			words2: releaseHistFull.bookwalker,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Rakuten',
			words1: prevReleaseHistFull.rakuten,
			words2: releaseHistFull.rakuten,
		}),
	);

	return diffs;
}
