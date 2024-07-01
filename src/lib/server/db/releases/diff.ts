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
import type { ReleaseEdit } from './releases';

export function getReleaseDiffs(params: {
	prevReleaseHistEdit: ReleaseEdit;
	releaseHistEdit: ReleaseEdit;
	displayPrefs: DisplayPrefs;
}) {
	const { prevReleaseHistEdit, releaseHistEdit, displayPrefs } = params;
	const diffs: Diff[] = [];
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Title',
			words1: prevReleaseHistEdit.title,
			words2: releaseHistEdit.title,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Romaji',
			words1: prevReleaseHistEdit.romaji,
			words2: releaseHistEdit.romaji,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateReleaseBookChangeStringFromBooks(
				prevReleaseHistEdit['books'],
				displayPrefs.title_prefs,
			),
			lines2: generateReleaseBookChangeStringFromBooks(
				releaseHistEdit['books'],
				displayPrefs.title_prefs,
			),
			name: 'Books',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			lines1: generateReleasePublisherChangeStringFromPublishers(
				prevReleaseHistEdit['publishers'],
				displayPrefs.names,
			),
			lines2: generateReleasePublisherChangeStringFromPublishers(
				releaseHistEdit['publishers'],
				displayPrefs.names,
			),
			name: 'Publishers',
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevReleaseHistEdit.hidden.toString(),
			words2: releaseHistEdit.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevReleaseHistEdit.locked.toString(),
			words2: releaseHistEdit.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Format',
			words1: prevReleaseHistEdit.format,
			words2: releaseHistEdit.format,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'ISBN13',
			words1: prevReleaseHistEdit.isbn13,
			words2: releaseHistEdit.isbn13,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Language',
			words1: prevReleaseHistEdit.lang,
			words2: releaseHistEdit.lang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Pages',
			words1: prevReleaseHistEdit.pages?.toString(),
			words2: releaseHistEdit.pages?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffChars({
			name: 'Release date',
			words1: new DateNumber(prevReleaseHistEdit.release_date).getDateFormatted(),
			words2: new DateNumber(releaseHistEdit.release_date).getDateFormatted(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Note',
			words1: prevReleaseHistEdit.description,
			words2: releaseHistEdit.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevReleaseHistEdit.website,
			words2: releaseHistEdit.website,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Amazon',
			words1: prevReleaseHistEdit.amazon,
			words2: releaseHistEdit.amazon,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Bookwalker',
			words1: prevReleaseHistEdit.bookwalker,
			words2: releaseHistEdit.bookwalker,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Rakuten',
			words1: prevReleaseHistEdit.rakuten,
			words2: releaseHistEdit.rakuten,
		}),
	);

	return diffs;
}
