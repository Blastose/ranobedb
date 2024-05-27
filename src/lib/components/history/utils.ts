import type { Language, SeriesRelType } from '$lib/server/db/dbTypes';
import { diffLines, diffWords, type Change } from 'diff';
import xss from 'xss';

export function generateLink(href: string, content: string) {
	return `<a class="link" target="_blank" href="${href}">${xss(content)}</a>`;
}

function generateSeriesBookChangeString(book: { id: number; title: string; sort_order: number }) {
	return `${generateLink(`/book/${book.id}`, book.title)} ${` [#${book.sort_order}]`}`;
}
export function generateSeriesBookChangeStringFromBooks(
	books: {
		id: number;
		title: string;
		sort_order: number;
	}[],
) {
	let str = '';
	for (const book of books) {
		str += generateSeriesBookChangeString(book) + '\n';
	}
	return str.trim();
}

function generateBookTitleChangeString(book: {
	lang: Language;
	title: string;
	romaji: string | null;
	official: boolean;
}) {
	let str = `[${book.lang}] ${book.title} [official: ${book.official}]`;
	if (book.romaji) {
		str += '\n' + `[${book.lang} Romaji] ${book.romaji}`;
	}
	return str;
}
export function generateBookTitleChangeStringFromBooks(
	books: {
		lang: Language;
		title: string;
		romaji: string | null;
		official: boolean;
	}[],
) {
	let str = '';
	for (const book of books) {
		str += generateBookTitleChangeString(book) + '\n';
	}
	return str.trim();
}
function generateSeriesRelationChangeString(series: {
	id: number;
	title: string;
	romaji: string | null;
	relation_type: SeriesRelType;
}) {
	return `${generateLink(`/series/${series.id}`, series.title)} ${` [${series.relation_type}]`}`;
}
export function generateSeriesRelationChangeStringFromSeries(
	series: {
		id: number;
		title: string;
		romaji: string | null;
		relation_type: SeriesRelType;
	}[],
) {
	let str = '';
	for (const serie of series) {
		str += generateSeriesRelationChangeString(serie) + '\n';
	}
	return str.trim();
}

export type Diff = {
	name: string;
	changes: Change[];
	type: 'line' | 'word' | 'char';
	textType: 'text' | 'html';
};
export function getDiffLines<J, T extends Record<K, J>, K extends keyof T>(params: {
	obj1: T;
	obj2: T;
	key: K;
	fn: (value: J) => string;
	name: string;
}): Diff | undefined {
	const { fn, obj1, obj2, key, name } = params;
	const changeStrings = { changeStr1: fn(obj1[key]), changeStr2: fn(obj2[key]) };
	const diffs = diffLines(changeStrings.changeStr1, changeStrings.changeStr2, {
		newlineIsToken: true,
	});
	for (const diff of diffs) {
		if (diff.removed || diff.added) {
			return { name, changes: diffs, type: 'line', textType: 'html' };
		}
	}
	return undefined;
}

export function getDiffWords(params: {
	words1: string;
	words2: string;
	name: string;
}): Diff | undefined {
	const diffs = diffWords(params.words1, params.words2);
	for (const diff of diffs) {
		if (diff.removed || diff.added) {
			return {
				changes: diffs,
				name: params.name,
				textType: 'text',
				type: 'word',
			};
		}
	}
	return undefined;
}
