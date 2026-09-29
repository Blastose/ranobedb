import { DateNumber } from '$lib/components/form/release/releaseDate';
import {
	generateSeriesBookChangeStringFromBooks,
	generateSeriesRelationChangeStringFromSeries,
	generateSeriesTagChangeStringFromSeries,
	getDiffLines,
	getDiffTitle,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { SeriesHistFull } from './series';

export function getSeriesDiffs(params: {
	prevSeriesHistFull: SeriesHistFull;
	seriesHistFull: SeriesHistFull;
	titlePrefs: DisplayPrefs['title_prefs'];
}) {
	const { prevSeriesHistFull, seriesHistFull, titlePrefs } = params;
	const diffs: Diff[] = [];

	pushIfNotUndefined(
		diffs,
		getDiffTitle({
			name: 'Title(s)',
			title1: prevSeriesHistFull['titles'],
			title2: seriesHistFull['titles'],
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Books',
			lines1: generateSeriesBookChangeStringFromBooks(prevSeriesHistFull['books'], titlePrefs),
			lines2: generateSeriesBookChangeStringFromBooks(seriesHistFull['books'], titlePrefs),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Series relations',
			lines1: generateSeriesRelationChangeStringFromSeries(
				prevSeriesHistFull['child_series'],
				titlePrefs,
			),
			lines2: generateSeriesRelationChangeStringFromSeries(
				seriesHistFull['child_series'],
				titlePrefs,
			),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Series tags',
			lines1: generateSeriesTagChangeStringFromSeries(prevSeriesHistFull['tags']),
			lines2: generateSeriesTagChangeStringFromSeries(seriesHistFull['tags']),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Hidden',
			words1: prevSeriesHistFull.hidden.toString(),
			words2: seriesHistFull.hidden.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Locked',
			words1: prevSeriesHistFull.locked.toString(),
			words2: seriesHistFull.locked.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Pub. status',
			words1: prevSeriesHistFull.publication_status,
			words2: seriesHistFull.publication_status,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Note',
			words1: prevSeriesHistFull.description,
			words2: seriesHistFull.description,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Original language',
			words1: prevSeriesHistFull.olang,
			words2: seriesHistFull.olang,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Website',
			words1: prevSeriesHistFull.website,
			words2: seriesHistFull.website,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Web novel',
			words1: prevSeriesHistFull.web_novel,
			words2: seriesHistFull.web_novel,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Anilist',
			words1: prevSeriesHistFull.anilist_id?.toString(),
			words2: seriesHistFull.anilist_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'MyAnimeList',
			words1: prevSeriesHistFull.mal_id?.toString(),
			words2: seriesHistFull.mal_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'AniDB',
			words1: prevSeriesHistFull.anidb_id?.toString(),
			words2: seriesHistFull.anidb_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'BookWalker',
			words1: prevSeriesHistFull.bookwalker_id?.toString(),
			words2: seriesHistFull.bookwalker_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffLines({
			name: 'Aliases',
			lines1: prevSeriesHistFull.aliases,
			lines2: seriesHistFull.aliases,
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Wikidata',
			words1: prevSeriesHistFull.wikidata_id?.toString(),
			words2: seriesHistFull.wikidata_id?.toString(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'Start date',
			words1: new DateNumber(prevSeriesHistFull.start_date).getDateFormatted(),
			words2: new DateNumber(seriesHistFull.start_date).getDateFormatted(),
		}),
	);
	pushIfNotUndefined(
		diffs,
		getDiffWords({
			name: 'End date',
			words1: new DateNumber(prevSeriesHistFull.end_date).getDateFormatted(),
			words2: new DateNumber(seriesHistFull.end_date).getDateFormatted(),
		}),
	);

	return diffs;
}
