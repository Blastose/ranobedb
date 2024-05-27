import { getNameDisplay, getTitleDisplay, type TitleDisplay } from '$lib/display/prefs';
import type {
	Language,
	ReleasePublisherType,
	ReleaseType,
	SeriesRelType,
} from '$lib/server/db/dbTypes';
import type { DisplayPrefs, Nullish } from '$lib/server/zod/schema';
import { diffChars, diffLines, diffWords, type Change } from 'diff';
import xss from 'xss';

export function generateLink(href: string, content: string) {
	return `<a class="link" target="_blank" href="${href}">${xss(content)}</a>`;
}

function generateSeriesBookChangeString(
	book: TitleDisplay & { sort_order: number; id: number },
	prefs: DisplayPrefs['title_prefs'],
) {
	return `${generateLink(
		`/book/${book.id}`,
		getTitleDisplay({ obj: book, prefs }),
	)} ${` [#${book.sort_order}]`}`;
}
export function generateSeriesBookChangeStringFromBooks(
	books: (TitleDisplay & { sort_order: number; id: number })[],
	prefs: DisplayPrefs['title_prefs'],
) {
	let str = '';
	for (const book of books) {
		str += generateSeriesBookChangeString(book, prefs) + '\n';
	}
	return str.trim();
}
function generateReleaseBookChangeString(
	book: TitleDisplay & { rtype: ReleaseType; id: number },
	prefs: DisplayPrefs['title_prefs'],
) {
	return `${generateLink(
		`/book/${book.id}`,
		getTitleDisplay({ obj: book, prefs }),
	)} ${` [${book.rtype}]`}`;
}
export function generateReleaseBookChangeStringFromBooks(
	books: (TitleDisplay & { rtype: ReleaseType; id: number })[],
	prefs: DisplayPrefs['title_prefs'],
) {
	let str = '';
	for (const book of books) {
		str += generateReleaseBookChangeString(book, prefs) + '\n';
	}
	return str.trim();
}
function generateReleasePublisherChangeString(
	publisher: {
		id: number;
		name: string;
		romaji: string | null;
		publisher_type: ReleasePublisherType;
	},
	prefs: DisplayPrefs['names'],
) {
	return `${generateLink(
		`/publisher/${publisher.id}`,
		getNameDisplay({ obj: publisher, prefs }),
	)} ${` [${publisher.publisher_type}]`}`;
}
export function generateReleasePublisherChangeStringFromPublishers(
	publishers: {
		id: number;
		name: string;
		romaji: string | null;
		publisher_type: ReleasePublisherType;
	}[],
	prefs: DisplayPrefs['names'],
) {
	let str = '';
	for (const publisher of publishers) {
		str += generateReleasePublisherChangeString(publisher, prefs) + '\n';
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
function generateSeriesRelationChangeString(
	series: {
		id: number;
		title: string;
		romaji: string | null;
		relation_type: SeriesRelType;
		lang: Language;
	},
	prefs: DisplayPrefs['title_prefs'],
) {
	return `${generateLink(
		`/series/${series.id}`,
		getTitleDisplay({ obj: series, prefs }),
	)} ${` [${series.relation_type}]`}`;
}
export function generateSeriesRelationChangeStringFromSeries(
	series: {
		id: number;
		title: string;
		romaji: string | null;
		relation_type: SeriesRelType;
		lang: Language;
	}[],
	prefs: DisplayPrefs['title_prefs'],
) {
	let str = '';
	for (const serie of series) {
		str += generateSeriesRelationChangeString(serie, prefs) + '\n';
	}
	return str.trim();
}

type StaffAlias = {
	main_alias: boolean;
	name: string;
	romaji: string | null;
};
function generateStaffAliasChangeString(alias: StaffAlias): string {
	return `${alias.name}${alias.romaji ? ` (${alias.romaji})` : ``}${
		alias.main_alias ? ` [primary]` : ``
	}`;
}
export function generateStaffAliasChangeStringFromStaffAliases(aliases: StaffAlias[]) {
	let str = '';
	for (const alias of aliases) {
		str += generateStaffAliasChangeString(alias) + '\n';
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
	words1: Nullish<string>;
	words2: Nullish<string>;
	name: string;
}): Diff | undefined {
	const diffs = diffWords(params.words1 ?? '', params.words2 ?? '');
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
export function getDiffChars(params: {
	words1: Nullish<string>;
	words2: Nullish<string>;
	name: string;
}): Diff | undefined {
	const diffs = diffChars(params.words1 ?? '', params.words2 ?? '');
	for (const diff of diffs) {
		if (diff.removed || diff.added) {
			return {
				changes: diffs,
				name: params.name,
				textType: 'text',
				type: 'char',
			};
		}
	}
	return undefined;
}

export function pushIfNotUndefined<T>(array: T[], item: T | undefined) {
	if (item) {
		array.push(item);
	}
}
