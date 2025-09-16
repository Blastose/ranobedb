import { ORIGIN } from '$env/static/private';
import { languagesArray } from '$lib/db/dbConsts';
import { getNameDisplay, getTitleDisplay, type TitleDisplay } from '$lib/display/prefs';
import type {
	Language,
	PublisherRelType,
	ReleasePublisherType,
	ReleaseType,
	SeriesBookType,
	SeriesRelType,
	StaffRole,
} from '$lib/server/db/dbTypes';
import type { DisplayPrefs, Nullish } from '$lib/server/zod/schema';
import { diffChars, diffLines, diffWords, type Change } from 'diff';
import xss from 'xss';

export function generateLink(href: string, content: string) {
	return `<a class="link" target="_blank" href="${ORIGIN}${href}">${xss(content, { whiteList: {} })}</a>`;
}

function generateSeriesBookChangeString(
	book: TitleDisplay & { sort_order: number; id: number; book_type: SeriesBookType },
	prefs: DisplayPrefs['title_prefs'],
) {
	return `${generateLink(
		`/book/${book.id}`,
		getTitleDisplay({ obj: book, prefs }),
	)} ${`[#${book.sort_order}]`} [${book.book_type}]`;
}
export function generateSeriesBookChangeStringFromBooks(
	books: (TitleDisplay & { sort_order: number; id: number; book_type: SeriesBookType })[],
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
export function generateBookTitleChangeStringTitle(book?: {
	lang: Language;
	title: string;
	romaji: string | null;
	official: boolean;
}) {
	if (!book) {
		return '';
	}
	let str = `[${book.lang}] ${book.title}`;
	return str;
}
export function generateBookTitleChangeStringRomaji(book?: {
	lang: Language;
	title: string;
	romaji: string | null;
	official: boolean;
}) {
	if (!book || !book.romaji) {
		return '';
	}
	let str = `[${book.lang} Romaji] ${book.romaji}`;
	return str;
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

function generateSeriesTagChangeString(tag: { id: number; name: string }) {
	return `${generateLink(`/series?tagsInclude=${tag.id}`, tag.name)}`;
}
export function generateSeriesTagChangeStringFromSeries(
	tags: {
		id: number;
		name: string;
	}[],
) {
	let str = '';
	for (const tag of tags) {
		str += generateSeriesTagChangeString(tag) + '\n';
	}
	return str;
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
type PublisherRel = {
	id: number;
	name: string;
	romaji: string | null;
	relation_type: PublisherRelType;
};
function generatePublisherRelChangeString(
	publisher: PublisherRel,
	prefs: DisplayPrefs['names'],
): string {
	return `${generateLink(`/publisher/${publisher.id}`, getNameDisplay({ obj: publisher, prefs }))} [${publisher.relation_type}]`;
}
export function generatePublisherRelChangeStringFromPublishers(
	publishers: PublisherRel[],
	prefs: DisplayPrefs['names'],
) {
	let str = '';
	for (const publisher of publishers) {
		str += generatePublisherRelChangeString(publisher, prefs) + '\n';
	}
	return str.trim();
}
type Edition = {
	book_id: number;
	title: string;
	lang: Language | null;
};
function generateBookEditionChangeString(edition: Edition): string {
	return `${edition.lang ? `[${edition.lang}]` : ''} ${edition.title}`;
}
export function generateBookEditionChangeStringFromEditions(editions: Edition[]) {
	let str = '';
	for (const edition of editions) {
		str += generateBookEditionChangeString(edition) + '\n';
	}
	return str.trim();
}
export type BookStaff = {
	staff_id: number;
	name: string;
	romaji: string | null;
	note: string;
	role_type: StaffRole;
	edition_name: string;
};
function generateBookStaffChangeString(staff: BookStaff, prefs: DisplayPrefs['names']): string {
	return `${staff.edition_name !== 'Original edition' ? `[${staff.edition_name}] ` : ''}${generateLink(`/staff/${staff.staff_id}`, getNameDisplay({ obj: staff, prefs }))}${` [${staff.role_type}]${staff.note ? ` [${staff.note}]` : ''}`}`;
}
export function generateBookStaffChangeStringFromStaffs(
	staffs: BookStaff[],
	prefs: DisplayPrefs['names'],
) {
	let str = '';
	for (const staff of staffs) {
		str += generateBookStaffChangeString(staff, prefs) + '\n';
	}
	return str.trim();
}

export type Diff =
	| {
			name: string;
			changes: Change[];
			type: 'line' | 'word' | 'char';
			textType: 'text' | 'html';
	  }
	| DiffTitles;

type DiffTitles = {
	name: string;
	changes: Change[][];
	type: 'title';
	textType: 'text';
};

export function getDiffLines(params: {
	lines1: string;
	lines2: string;
	name: string;
}): Diff | undefined {
	const { lines1, lines2, name } = params;
	const diffs = diffLines(lines1, lines2, {
		newlineIsToken: true,
	});
	let isDiff = false;
	for (const diff of diffs) {
		diff.value = xss(diff.value, {
			whiteList: {
				a: ['href', 'class', 'target'],
			},
			onTagAttr(tag, name, value) {
				if (tag === 'a' && name === 'href') {
					if (!value.startsWith(ORIGIN)) {
						return '';
					}
				}
			},
		});
		if (diff.removed || diff.added) {
			isDiff = true;
		}
	}
	if (isDiff) {
		return { name, changes: diffs, type: 'line', textType: 'html' };
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
export function getDiffTitle(params: {
	title1: { title: string; romaji: string | null; lang: Language; official: boolean }[];
	title2: { title: string; romaji: string | null; lang: Language; official: boolean }[];
	name: string;
}): Diff | undefined {
	const changes: Change[][] = [];
	// TODO - This iterates over all languages and finds the matching lang for each title which could be slow,
	// so this is a potential speed up if the speed ever becomes an issue
	for (const i of languagesArray) {
		const title1 = params.title1.find((v) => v.lang === i);
		const title2 = params.title2.find((v) => v.lang === i);
		if (!title1 && !title2) {
			continue;
		}
		const diffsTitle = diffChars(
			generateBookTitleChangeStringTitle(title1),
			generateBookTitleChangeStringTitle(title2),
		);
		const diffsRomaji = diffChars(
			generateBookTitleChangeStringRomaji(title1),
			generateBookTitleChangeStringRomaji(title2),
		);
		for (const diff of diffsTitle) {
			if (diff.removed || diff.added) {
				changes.push(diffsTitle);
				break;
			}
		}
		for (const diff of diffsRomaji) {
			if (diff.removed || diff.added) {
				changes.push(diffsRomaji);
				break;
			}
		}
	}
	if (changes.length > 0) {
		return {
			changes: changes,
			name: 'Title(s)',
			textType: 'text',
			type: 'title',
		};
	}
	return undefined;
}
export function pushIfNotUndefined<T>(array: T[], item: T | undefined) {
	if (item) {
		array.push(item);
	}
}
