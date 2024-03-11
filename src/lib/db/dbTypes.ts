import type { ColumnType } from 'kysely';

export const dbItemArray = ['book', 'publisher', 'release', 'series', 'staff'] as const;

export type DbItem = (typeof dbItemArray)[number];

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;

export type DateString = ColumnType<string, string, string>;

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
	'zh-Hant'
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
	'zh-Hant': 'Chinese (Traditional)'
};

export type Language = (typeof languagesArray)[number];

export const publisherRelTypeArray = [
	'imprint',
	'parent brand',
	'parent company',
	'subsidiary'
] as const;

export const publisherTypeReverseMap: Record<PublisherRelType, PublisherRelType> = {
	imprint: 'parent brand',
	subsidiary: 'parent company',
	'parent brand': 'imprint',
	'parent company': 'subsidiary'
};

export type PublisherRelType = (typeof publisherRelTypeArray)[number];

export type ReleaseFormat = 'audio' | 'digital' | 'print';

export type ReleasePublisherType = 'label' | 'publisher';

export type ReleaseType = 'complete' | 'partial';

export type SeriesStatus = 'cancelled' | 'completed' | 'ongoing' | 'unknown';

export const staffRolesArray = ['artist', 'author', 'editor', 'translator'] as const;

export type StaffRole = (typeof staffRolesArray)[number];

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type UserRole = 'admin' | 'banned' | 'editor' | 'moderator' | 'unverified' | 'user';

export interface AuthSession {
	expires_at: Timestamp;
	id: string;
	user_id: string;
}

export interface AuthUser {
	id: string;
	id_numeric: Generated<number>;
	joined: Generated<Timestamp>;
	role: Generated<UserRole>;
	username: string;
	username_lowercase: string;
}

export interface AuthUserCredentials {
	email: string;
	hashed_password: string;
	user_id: string;
}

export interface Book {
	description: string;
	description_ja: string | null;
	hidden: boolean;
	id: Generated<number>;
	image_id: number | null;
	locked: boolean;
}

export interface BookHist {
	change_id: number;
	description: string;
	description_ja: string | null;
	image_id: number | null;
}

export interface BookStaffAlias {
	book_id: number;
	note: string;
	role_type: StaffRole;
	staff_alias_id: number;
}

export interface BookStaffAliasHist {
	change_id: number;
	note: string;
	role_type: StaffRole;
	staff_alias_id: number;
}

export interface BookTitle {
	book_id: number;
	lang: Language;
	official: boolean;
	romaji: string | null;
	title: string;
}

export interface BookTitleHist {
	change_id: number;
	lang: Language;
	official: boolean;
	romaji: string | null;
	title: string;
}

export interface Change {
	added: Generated<Timestamp>;
	comments: string;
	id: Generated<number>;
	ihid: boolean;
	ilock: boolean;
	item_id: number;
	item_name: DbItem;
	revision: number;
	user_id: string;
}

export interface Image {
	filename: string;
	height: number;
	id: Generated<number>;
	spoiler: boolean;
	width: number;
}

export interface Publisher {
	description: string;
	hidden: boolean;
	id: Generated<number>;
	locked: boolean;
	name: string;
	romaji: string | null;
}

export interface PublisherHist {
	change_id: number;
	description: string;
	name: string;
	romaji: string | null;
}

export interface PublisherRelation {
	id_child: number;
	id_parent: number;
	relation_type: PublisherRelType;
}

export interface PublisherRelationHist {
	change_id: number;
	id_child: number;
	relation_type: PublisherRelType;
}

export interface Release {
	description: string;
	format: ReleaseFormat;
	id: Generated<number>;
	isbn13: string | null;
	lang: Language;
	pages: number | null;
	release_date: number;
	romaji: string | null;
	title: string;
}

export interface ReleaseBook {
	book_id: number;
	release_id: number;
	rtype: ReleaseType;
}

export interface ReleasePublisher {
	publisher_id: number;
	publisher_type: ReleasePublisherType;
	release_id: number;
}

export interface Series {
	bookwalker_id: number | null;
	id: Generated<number>;
	publication_status: SeriesStatus;
}

export interface SeriesBook {
	book_id: number;
	series_id: number;
	sort_order: number;
}

export interface SeriesTitle {
	lang: Language;
	official: boolean;
	romaji: string | null;
	series_id: number;
	title: string;
}

export interface Staff {
	bookwalker_id: number | null;
	description: string;
	hidden: boolean;
	id: Generated<number>;
	locked: boolean;
}

export interface StaffAlias {
	id: Generated<number>;
	main_alias: boolean;
	name: string;
	romaji: string | null;
	staff_id: number;
}

export interface StaffHist {
	bookwalker_id: number | null;
	change_id: number;
	description: string;
}

export interface StaffAliasHist {
	aid: number;
	change_id: number;
	main_alias: boolean;
	name: string;
	romaji: string | null;
}

export interface UserListBook {
	added: Generated<Timestamp>;
	book_id: number;
	finished: DateString | null;
	notes: string;
	score: number | null;
	started: DateString | null;
	user_id: string;
}

export interface UserListBookLabel {
	book_id: number;
	label_id: number;
	user_id: string;
}

export interface UserListLabel {
	id: number;
	label: string;
	private: boolean;
	user_id: string;
}

export interface DB {
	auth_session: AuthSession;
	auth_user: AuthUser;
	auth_user_credentials: AuthUserCredentials;
	book: Book;
	book_hist: BookHist;
	book_staff_alias: BookStaffAlias;
	book_staff_alias_hist: BookStaffAliasHist;
	book_title: BookTitle;
	book_title_hist: BookTitleHist;
	change: Change;
	image: Image;
	publisher: Publisher;
	publisher_hist: PublisherHist;
	publisher_relation: PublisherRelation;
	publisher_relation_hist: PublisherRelationHist;
	release: Release;
	release_book: ReleaseBook;
	release_publisher: ReleasePublisher;
	series: Series;
	series_book: SeriesBook;
	series_title: SeriesTitle;
	staff: Staff;
	staff_alias: StaffAlias;
	staff_hist: StaffHist;
	staff_alias_hist: StaffAliasHist;
	user_list_book: UserListBook;
	user_list_book_label: UserListBookLabel;
	user_list_label: UserListLabel;
}
