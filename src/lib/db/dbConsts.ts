import type { LanguagePriority } from '$lib/server/db/dbHelpers';
import type {
	ReadingStatus,
	Language,
	PublisherRelType,
	SeriesRelType,
} from '$lib/server/db/dbTypes';
import type { DisplayPrefs } from '$lib/server/zod/schema';

export const languagesArray = [
	'ar',
	'bg',
	'ca',
	'ck',
	'cs',
	'da',
	'de',
	'el',
	'en',
	'eo',
	'es',
	'eu',
	'fa',
	'fi',
	'fr',
	'ga',
	'gd',
	'he',
	'hi',
	'hr',
	'hu',
	'id',
	'it',
	'iu',
	'ja',
	'ko',
	'la',
	'lt',
	'lv',
	'mk',
	'ms',
	'nl',
	'no',
	'pl',
	'pt-br',
	'pt-pt',
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
	'zh-Hans',
	'zh-Hant',
] as const;

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

export const releaseFormatArray = ['audio', 'digital', 'print'] as const;

export const releasePublisherTypeArray = ['label', 'publisher'] as const;

export const releaseTypeArray = ['complete', 'partial', 'omnibus'] as const;

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
	'artist',
	'author',
	'editor',
	'translator',
	'narrator',
	'staff',
] as const;

export const seriesStatusArray = ['ongoing', 'completed', 'cancelled', 'unknown'] as const;

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
};
