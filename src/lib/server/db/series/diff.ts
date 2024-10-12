import { DateNumber } from '$lib/components/form/release/releaseDate';
import {
	generateBookTitleChangeStringFromBooks,
	generateSeriesBookChangeStringFromBooks,
	generateSeriesRelationChangeStringFromSeries,
	generateSeriesTagChangeStringFromSeries,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { SeriesEdit } from './series';

export function getSeriesDiffs(params: {
	prevSeriesHistEdit: SeriesEdit;
	seriesHistEdit: SeriesEdit;
	titlePrefs: DisplayPrefs['title_prefs'];
}) {
	const { prevSeriesHistEdit, seriesHistEdit, titlePrefs } = params;
	const diffs: Diff[] = [];

	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Title(s)',
			lines1: generateBookTitleChangeStringFromBooks(prevSeriesHistEdit['titles']),
			lines2: generateBookTitleChangeStringFromBooks(seriesHistEdit['titles']),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Books',
			lines1: generateSeriesBookChangeStringFromBooks(prevSeriesHistEdit['books'], titlePrefs),
			lines2: generateSeriesBookChangeStringFromBooks(seriesHistEdit['books'], titlePrefs),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Series relations',
			lines1: generateSeriesRelationChangeStringFromSeries(
				prevSeriesHistEdit['child_series'],
				titlePrefs,
			),
			lines2: generateSeriesRelationChangeStringFromSeries(
				seriesHistEdit['child_series'],
				titlePrefs,
			),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Series tags',
			lines1: generateSeriesTagChangeStringFromSeries(prevSeriesHistEdit['tags']),
			lines2: generateSeriesTagChangeStringFromSeries(seriesHistEdit['tags']),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevSeriesHistEdit.hidden.toString(),
			words2: seriesHistEdit.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevSeriesHistEdit.locked.toString(),
			words2: seriesHistEdit.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Pub. status',
			words1: prevSeriesHistEdit.publication_status,
			words2: seriesHistEdit.publication_status,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Note',
			words1: prevSeriesHistEdit.description,
			words2: seriesHistEdit.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Original language',
			words1: prevSeriesHistEdit.olang,
			words2: seriesHistEdit.olang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Web novel',
			words1: prevSeriesHistEdit.web_novel,
			words2: seriesHistEdit.web_novel,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Anilist',
			words1: prevSeriesHistEdit.anilist_id?.toString(),
			words2: seriesHistEdit.anilist_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'MyAnimeList',
			words1: prevSeriesHistEdit.mal_id?.toString(),
			words2: seriesHistEdit.mal_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'AniDB',
			words1: prevSeriesHistEdit.anidb_id?.toString(),
			words2: seriesHistEdit.anidb_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Bookwalker',
			words1: prevSeriesHistEdit.bookwalker_id?.toString(),
			words2: seriesHistEdit.bookwalker_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Aliases',
			lines1: prevSeriesHistEdit.aliases,
			lines2: seriesHistEdit.aliases,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Wikidata',
			words1: prevSeriesHistEdit.wikidata_id?.toString(),
			words2: seriesHistEdit.wikidata_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Start date',
			words1: new DateNumber(prevSeriesHistEdit.start_date).getDateFormatted(),
			words2: new DateNumber(seriesHistEdit.start_date).getDateFormatted(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'End date',
			words1: new DateNumber(prevSeriesHistEdit.end_date).getDateFormatted(),
			words2: new DateNumber(seriesHistEdit.end_date).getDateFormatted(),
		}),
	);

	return diffs;
}
