import {
	defaultUserListLabelsArray,
	publisherRelTypeArray,
	seriesBookTypeArray,
} from '$lib/db/dbConsts';
import { releaseFormatArray } from '$lib/db/dbConsts';
import { dbItemArray } from '$lib/db/dbConsts';
import {
	releasePublisherTypeArray,
	releaseTypeArray,
	seriesRelTypeArray,
	seriesStatusArray,
	staffRolesArray,
} from '$lib/db/dbConsts';
import { languagesArray } from '$lib/db/dbConsts';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { ColumnType } from 'kysely';

export type DbItem = (typeof dbItemArray)[number];

export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;

export type Json<T> = ColumnType<T, string, string>;

export type DateString = ColumnType<string, string, string>;

export type Language = (typeof languagesArray)[number];

export type PublisherRelType = (typeof publisherRelTypeArray)[number];

export type ReleaseFormat = (typeof releaseFormatArray)[number];

export type ReleasePublisherType = (typeof releasePublisherTypeArray)[number];

export type ReleaseType = (typeof releaseTypeArray)[number];

export type SeriesBookType = (typeof seriesBookTypeArray)[number];

export type SeriesRelType = (typeof seriesRelTypeArray)[number];

export type SeriesStatus = (typeof seriesStatusArray)[number];

export type StaffRole = (typeof staffRolesArray)[number];

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type UserRole = 'admin' | 'banned' | 'editor' | 'moderator' | 'user';

export type ReadingStatus = (typeof defaultUserListLabelsArray)[number];

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
	display_prefs: Generated<Json<DisplayPrefs>>;
	username: string;
	username_lowercase: string;
}

export interface AuthUserCredentials {
	email: string;
	email_verified: Generated<boolean>;
	hashed_password: string;
	user_id: string;
}

export interface Book {
	description: string;
	description_ja: string;
	hidden: boolean;
	id: Generated<number>;
	image_id: number | null;
	locked: boolean;
	release_date: number;
}

export interface BookEdition {
	book_id: number;
	eid: number;
	lang: Language;
	title: string;
}

export interface BookEditionHist {
	change_id: number;
	eid: number;
	lang: Language;
	title: string;
}

export interface BookHist {
	change_id: number;
	description: string;
	description_ja: string;
	image_id: number | null;
	release_date: number;
}

export interface BookStaffAlias {
	book_id: number;
	note: string;
	role_type: StaffRole;
	staff_alias_id: number;
	eid: number;
}

export interface BookStaffAliasHist {
	change_id: number;
	note: string;
	role_type: StaffRole;
	staff_alias_id: number;
	eid: number;
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

export interface EmailVerificationCode {
	code: string;
	email: string;
	expires_at: Timestamp;
	id: Generated<number>;
	user_id: string;
}

export interface Image {
	filename: string;
	height: number;
	id: Generated<number>;
	nsfw: boolean;
	spoiler: boolean;
	width: number;
}

export interface Publisher {
	bookwalker_id: number | null;
	description: string;
	hidden: boolean;
	id: Generated<number>;
	locked: boolean;
	name: string;
	romaji: string | null;
	twitter_id: string | null;
	website: string | null;
	wikidata_id: number | null;
}

export interface PublisherHist {
	bookwalker_id: number | null;
	change_id: number;
	description: string;
	name: string;
	romaji: string | null;
	twitter_id: string | null;
	website: string | null;
	wikidata_id: number | null;
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
	amazon: string | null;
	bookwalker: string | null;
	description: string;
	format: ReleaseFormat;
	hidden: boolean;
	id: Generated<number>;
	isbn13: string | null;
	lang: Language;
	locked: boolean;
	pages: number | null;
	rakuten: string | null;
	release_date: number;
	romaji: string | null;
	title: string;
	website: string | null;
}

export interface ReleaseBook {
	book_id: number;
	release_id: number;
	rtype: ReleaseType;
}

export interface ReleaseBookHist {
	book_id: number;
	change_id: number;
	rtype: ReleaseType;
}

export interface ReleaseHist {
	amazon: string | null;
	bookwalker: string | null;
	change_id: number;
	description: string;
	format: ReleaseFormat;
	isbn13: string | null;
	lang: Language;
	pages: number | null;
	rakuten: string | null;
	release_date: number;
	romaji: string | null;
	title: string;
	website: string | null;
}

export interface ReleasePublisher {
	publisher_id: number;
	publisher_type: ReleasePublisherType;
	release_id: number;
}

export interface ReleasePublisherHist {
	change_id: number;
	publisher_id: number;
	publisher_type: ReleasePublisherType;
}

export interface Series {
	aliases: string;
	anidb_id: number | null;
	bookwalker_id: number | null;
	description: string;
	end_date: number;
	hidden: boolean;
	id: Generated<number>;
	locked: boolean;
	publication_status: SeriesStatus;
	start_date: number;
	web_novel: string | null;
	wikidata_id: number | null;
}

export interface SeriesBook {
	book_id: number;
	book_type: SeriesBookType;
	series_id: number;
	sort_order: number;
}
export interface SeriesBookHist {
	book_id: number;
	book_type: SeriesBookType;
	change_id: number;
	sort_order: number;
}

export interface SeriesHist {
	aliases: string;
	anidb_id: number | null;
	bookwalker_id: number | null;
	change_id: number;
	description: string;
	end_date: number;
	publication_status: SeriesStatus;
	start_date: number;
	web_novel: string | null;
	wikidata_id: number | null;
}

export interface SeriesRelation {
	id_child: number;
	id_parent: number;
	relation_type: SeriesRelType;
}

export interface SeriesRelationHist {
	change_id: number;
	id_child: number;
	relation_type: SeriesRelType;
}

export interface SeriesTitle {
	lang: Language;
	official: boolean;
	romaji: string | null;
	series_id: number;
	title: string;
}

export interface SeriesTitleHist {
	change_id: number;
	lang: Language;
	official: boolean;
	romaji: string | null;
	title: string;
}
export interface Staff {
	bookwalker_id: number | null;
	description: string;
	hidden: boolean;
	id: Generated<number>;
	locked: boolean;
	pixiv_id: number | null;
	twitter_id: string | null;
	website: string | null;
	wikidata_id: number | null;
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
	pixiv_id: number | null;
	twitter_id: string | null;
	website: string | null;
	wikidata_id: number | null;
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
	book_edition: BookEdition;
	book_edition_hist: BookEditionHist;
	book_hist: BookHist;
	book_staff_alias: BookStaffAlias;
	book_staff_alias_hist: BookStaffAliasHist;
	book_title: BookTitle;
	book_title_hist: BookTitleHist;
	change: Change;
	email_verification_code: EmailVerificationCode;
	image: Image;
	publisher: Publisher;
	publisher_hist: PublisherHist;
	publisher_relation: PublisherRelation;
	publisher_relation_hist: PublisherRelationHist;
	release: Release;
	release_book: ReleaseBook;
	release_book_hist: ReleaseBookHist;
	release_hist: ReleaseHist;
	release_publisher: ReleasePublisher;
	release_publisher_hist: ReleasePublisherHist;
	series: Series;
	series_book: SeriesBook;
	series_book_hist: SeriesBookHist;
	series_hist: SeriesHist;
	series_relation: SeriesRelation;
	series_relation_hist: SeriesRelationHist;
	series_title: SeriesTitle;
	series_title_hist: SeriesTitleHist;
	staff: Staff;
	staff_alias: StaffAlias;
	staff_hist: StaffHist;
	staff_alias_hist: StaffAliasHist;
	user_list_book: UserListBook;
	user_list_book_label: UserListBookLabel;
	user_list_label: UserListLabel;
}
