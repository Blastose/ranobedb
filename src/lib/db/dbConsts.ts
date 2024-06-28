import type { IconType } from '$lib/components/icon/Icon.svelte';
import type {
	ReadingStatus,
	Language,
	PublisherRelType,
	SeriesRelType,
} from '$lib/server/db/dbTypes';
import type { DisplayPrefs } from '$lib/server/zod/schema';
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
	'parent story',
	'prequel',
	'sequel',
	'side story',
	'main story',
	'spin-off',
] as const;

export const seriesRelTypeReverseMap: Record<SeriesRelType, SeriesRelType> = {
	prequel: 'sequel',
	sequel: 'prequel',
	'side story': 'main story',
	'main story': 'side story',
	'spin-off': 'parent story',
	'parent story': 'spin-off',
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
	'cancelled',
	'unknown',
] as const;

export const dbItemArray = ['book', 'publisher', 'release', 'series', 'staff'] as const;

export const defaultUserListLabelsArray = [
	'Reading',
	'Finished',
	'Plan to read',
	'Stalled',
	'Dropped',
] as const;

export const defaultUserListLabelsMap = new Map<ReadingStatus, number>();
export const defaultUserListLabels = defaultUserListLabelsArray.map((v, index) => {
	defaultUserListLabelsMap.set(v, index + 1);
	return { id: index + 1, label: v };
});

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
export const settingsTabs = ['account', 'display', 'email'] as const;
export type SettingsTab = (typeof settingsTabs)[number];

export const historyFilterChangeType = ['all', 'edit', 'add'] as const;
export const historyFilterVisibilitys = ['all', 'public', 'deleted', 'locked'] as const;

export const logicalOps = ['and', 'or'] as const;
export type LogicalOp = (typeof logicalOps)[number];
