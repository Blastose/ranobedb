import type { IconType } from '$lib/components/icon/Icon.svelte';
import type {
	ReadingStatus,
	Language,
	PublisherRelType,
	SeriesRelType,
} from '$lib/server/db/dbTypes';
import type { DisplayPrefs, UserListSeriesSettings } from '$lib/server/zod/schema';
import type { LanguagePriority } from '$lib/server/zod/schema';

export const languagesArray = [
	'ja',
	'en',
	'zh-Hans',
	'zh-Hant',
	'fr',
	'es',
	'ko',
	'ar',
	'bg',
	'ca',
	'cs',
	'ck',
	'da',
	'de',
	'el',
	'eo',
	'eu',
	'fa',
	'fi',
	'ga',
	'gd',
	'he',
	'hi',
	'hr',
	'hu',
	'id',
	'it',
	'iu',
	'mk',
	'ms',
	'la',
	'lt',
	'lv',
	'nl',
	'no',
	'pl',
	'pt-pt',
	'pt-br',
	'ro',
	'ru',
	'sk',
	'sl',
	'sr',
	'sv',
	'ta',
	'th',
	'tr',
	'uk',
	'ur',
	'vi',
] as const;

export const languageSortPrio: Record<Language, number> = languagesArray.reduce(
	(acc, currV, currIndex) => {
		acc[currV] = currIndex;
		return acc;
	},
	{} as Record<Language, number>,
);

export const languageNames: Record<Language, string> = {
	ar: 'Arabic',
	bg: 'Bulgarian',
	ca: 'Catalan',
	ck: 'Chukchi',
	cs: 'Czech',
	da: 'Danish',
	de: 'German',
	el: 'Greek',
	en: 'English',
	eo: 'Esperanto',
	es: 'Spanish',
	eu: 'Basque',
	fa: 'Persian',
	fi: 'Finnish',
	fr: 'French',
	ga: 'Irish',
	gd: 'Scottish Gaelic',
	he: 'Hebrew',
	hi: 'Hindi',
	hr: 'Croatian',
	hu: 'Hungarian',
	id: 'Indonesian',
	it: 'Italian',
	iu: 'Inuktitut',
	ja: 'Japanese',
	ko: 'Korean',
	la: 'Latin',
	lt: 'Lithuanian',
	lv: 'Latvian',
	mk: 'Macedonian',
	ms: 'Malay',
	nl: 'Dutch',
	no: 'Norwegian',
	pl: 'Polish',
	'pt-br': 'Portuguese (Brazil)',
	'pt-pt': 'Portuguese (Portugal)',
	ro: 'Romanian',
	ru: 'Russian',
	sk: 'Slovak',
	sl: 'Slovenian',
	sr: 'Serbian',
	sv: 'Swedish',
	ta: 'Tamil',
	th: 'Thai',
	tr: 'Turkish',
	uk: 'Ukrainian',
	ur: 'Urdu',
	vi: 'Vietnamese',
	'zh-Hans': 'Chinese (Simplified)',
	'zh-Hant': 'Chinese (Traditional)',
};

export const langsWithoutRomaji = [
	'en',
	'fr',
	'es',
	'ca',
	'cs',
	'da',
	'de',
	'eo',
	'eu',
	'fi',
	'ga',
	'gd',
	'hr',
	'hu',
	'id',
	'it',
	'ms',
	'nl',
	'no',
	'pl',
	'pt-pt',
	'pt-br',
	'ro',
	'sk',
	'sl',
	'sv',
	'tr',
	'vi',
]; // no const since TS errors when passing something that is wider with .includes()

export const publisherRelTypeArray = [
	'imprint',
	'parent brand',
	'parent company',
	'subsidiary',
] as const;

export const publisherTypeReverseMap: Record<PublisherRelType, PublisherRelType> = {
	imprint: 'parent brand',
	subsidiary: 'parent company',
	'parent brand': 'imprint',
	'parent company': 'subsidiary',
};

export const releaseFormatArray = ['digital', 'print', 'audio'] as const;

export const releasePublisherTypeArray = ['imprint', 'publisher'] as const;

export const releaseTypeArray = ['complete', 'partial', 'omnibus'] as const;

export const seriesBookTypeArray = ['main', 'sub'] as const;

export const seriesRelTypeArray = [
	'prequel',
	'sequel',
	'side story',
	'main story',
	'spin-off',
	'parent story',
	'alternate version',
] as const;

export const seriesRelTypeReverseMap: Record<SeriesRelType, SeriesRelType> = {
	prequel: 'sequel',
	sequel: 'prequel',
	'side story': 'main story',
	'main story': 'side story',
	'spin-off': 'parent story',
	'parent story': 'spin-off',
	'alternate version': 'alternate version',
};

export const staffRolesArray = [
	'author',
	'artist',
	'editor',
	'staff',
	'translator',
	'narrator',
] as const;

export const seriesStatusArray = [
	'ongoing',
	'completed',
	'hiatus',
	'stalled',
	'cancelled',
	'unknown',
] as const;

export const tagTypeArray = ['content', 'demographic', 'genre', 'tag'] as const;

export const dbItemArray = ['book', 'publisher', 'release', 'series', 'staff'] as const;

export const defaultUserListLabelsArray = [
	'Reading',
	'Finished',
	'Plan to read',
	'Stalled',
	'Dropped',
	'Other',
] as const;

export const defaultUserListLabelsArrayAndRemove = [
	...defaultUserListLabelsArray,
	'Remove',
] as const;

export const defaultUserListLabelsMap = new Map<ReadingStatus, number>();
export const defaultUserListLabels = defaultUserListLabelsArray.map((v, index) => {
	defaultUserListLabelsMap.set(v, index + 1);
	return { id: index + 1, label: v };
});

export const defaultUserListSeriesSettings = {
	formats: [],
	langs: ['en'],
	notify_book: false,
	readingStatus: 'Reading',
	show_upcoming: true,
} satisfies UserListSeriesSettings;

export const userListStatus = ['Any', 'In my list', 'Not in my list'] as const;
export type UserListStatus = (typeof userListStatus)[number];

export const userListReleaseStatus = [
	'owned',
	'deleted',
	'on loan',
	'pending',
	'unknown',
	'notify',
] as const;

export const defaultLangPrio: LanguagePriority[] = [
	{ lang: 'en', romaji: false },
	{ lang: 'ja', romaji: true },
];

export const defaultDisplayPrefs: DisplayPrefs = {
	names: 'romaji',
	title_prefs: defaultLangPrio,
	descriptions: 'en',
};

export const staffTabs = ['series', 'books'] as const;
export const staffTabsIconsMap: Record<(typeof staffTabs)[number], IconType> = {
	books: 'book',
	series: 'bookshelf',
};
export const publisherTabs = ['series', 'books', 'releases'] as const;
export const publisherTabsIconsMap: Record<(typeof publisherTabs)[number], IconType> = {
	books: 'book',
	series: 'bookshelf',
	releases: 'file',
};
export const settingsTabs = ['account', 'display', 'list', 'email'] as const;
export type SettingsTab = (typeof settingsTabs)[number];

export const historyFilterChangeType = ['all', 'edit', 'add'] as const;
export const historyFilterVisibilitys = ['all', 'public', 'deleted', 'locked'] as const;

export const logicalOps = ['and', 'or'] as const;
export type LogicalOp = (typeof logicalOps)[number];

export const booksSortArray = [
	'Relevance desc',
	'Relevance asc',
	'Title asc',
	'Title desc',
	'Release date asc',
	'Release date desc',
] as const;

export const booksUserListSortArray = [
	...booksSortArray,
	'Score asc',
	'Score desc',
	'Added asc',
	'Added desc',
	'Last updated asc',
	'Last updated desc',
	'Started asc',
	'Started desc',
	'Finished asc',
	'Finished desc',
] as const;

export const seriesSortArray = [
	'Relevance desc',
	'Relevance asc',
	'Title asc',
	'Title desc',
	'Start date asc',
	'Start date desc',
	'End date asc',
	'End date desc',
	'Latest release asc',
	'Latest release desc',
	'Num. books asc',
	'Num. books desc',
] as const;

export const seriesUserListSortArray = [
	...seriesSortArray,
	'Score asc',
	'Score desc',
	'Added asc',
	'Added desc',
	'Last updated asc',
	'Last updated desc',
	'Started asc',
	'Started desc',
	'Finished asc',
	'Finished desc',
] as const;

export const releaseSortArray = [
	'Relevance desc',
	'Relevance asc',
	'Title asc',
	'Title desc',
	'Release date asc',
	'Release date desc',
	'Pages asc',
	'Pages desc',
] as const;
