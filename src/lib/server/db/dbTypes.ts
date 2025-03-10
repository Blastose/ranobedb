import {
	defaultUserListLabelsArray,
	publisherRelTypeArray,
	seriesBookTypeArray,
	tagTypeArray,
	userListReleaseStatus,
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
import type { DisplayPrefs, UserListSeriesSettings } from '$lib/server/zod/schema';
import type { ColumnType } from 'kysely';

export type DbItem = (typeof dbItemArray)[number];

export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;

export type Json<T> = ColumnType<T, string, string>;

export type DateString = ColumnType<string, string, string>;

export type Language = (typeof languagesArray)[number];

export type ListLabelTarget = 'book' | 'both' | 'series';

export type UserListReleaseStatus = (typeof userListReleaseStatus)[number];

export type PublisherRelType = (typeof publisherRelTypeArray)[number];

export type ReleaseFormat = (typeof releaseFormatArray)[number];

export type ReleasePublisherType = (typeof releasePublisherTypeArray)[number];

export type ReleaseType = (typeof releaseTypeArray)[number];

export type SeriesBookType = (typeof seriesBookTypeArray)[number];

export type SeriesRelType = (typeof seriesRelTypeArray)[number];

export type SeriesStatus = (typeof seriesStatusArray)[number];

export type StaffRole = (typeof staffRolesArray)[number];

export type TagType = (typeof tagTypeArray)[number];

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type UserRole = 'admin' | 'banned' | 'editor' | 'adder' | 'moderator' | 'user';

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
	olang: Language;
	locked: boolean;
	release_date: number;
	c_release_date: number;
}

export interface BookEdition {
	book_id: number;
	eid: number;
	lang: Language | null;
	title: string;
}

export interface BookEditionHist {
	change_id: number;
	eid: number;
	lang: Language | null;
	title: string;
}

export interface BookHist {
	change_id: number;
	description: string;
	description_ja: string;
	image_id: number | null;
	olang: Language;
	release_date: number;
	c_release_date: Generated<number>;
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
	official: true;
	romaji: string | null;
	title: string;
}

export interface BookTitleHist {
	change_id: number;
	lang: Language;
	official: true;
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

export interface EmailVerificationToken {
	expires_at: Timestamp;
	id: Generated<number>;
	new_email: string;
	token_hash: string;
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

export interface Notification {
	hidden: boolean;
	id: Generated<number>;
	is_read: boolean;
	item_id: number | null;
	item_name: DbItem | null;
	message: string;
	notification_type: string;
	sent: Generated<Timestamp>;
	url: string;
	user_id: string;
}

export interface PasswordResetToken {
	expires_at: Timestamp;
	id: Generated<number>;
	token_hash: string;
	user_id: string;
}

export interface Publisher {
	bookwalker: string | null;
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
	bookwalker: string | null;
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
	anilist_id: number | null;
	bookwalker_id: number | null;
	c_end_date: number;
	c_num_books: number;
	c_start_date: number;
	description: string;
	end_date: number;
	hidden: boolean;
	id: Generated<number>;
	locked: boolean;
	mal_id: number | null;
	olang: Language;
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
	anilist_id: number | null;
	bookwalker_id: number | null;
	c_end_date: Generated<number>;
	c_start_date: Generated<number>;
	change_id: number;
	description: string;
	end_date: number;
	mal_id: number | null;
	olang: Language;
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

export interface SeriesTag {
	series_id: number;
	tag_id: number;
}

export interface SeriesTagHist {
	change_id: number;
	tag_id: number;
}

export interface SeriesTitle {
	lang: Language;
	official: true;
	romaji: string | null;
	series_id: number;
	title: string;
}

export interface SeriesTitleHist {
	change_id: number;
	lang: Language;
	official: true;
	romaji: string | null;
	title: string;
}
export interface Staff {
	bookwalker_id: number | null;
	bookwalker_gl_id: number | null;
	description: string;
	hidden: boolean;
	id: Generated<number>;
	kakuyomu_id: string | null;
	locked: boolean;
	pixiv_id: number | null;
	syosetu_id: number | null;
	twitter_id: string | null;
	bsky_id: string | null;
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
	bookwalker_gl_id: number | null;
	change_id: number;
	description: string;
	kakuyomu_id: string | null;
	pixiv_id: number | null;
	syosetu_id: number | null;
	twitter_id: string | null;
	bsky_id: string | null;
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

export interface Tag {
	description: string | null;
	id: Generated<number>;
	name: string;
	ttype: TagType;
}

export interface UserBookReview {
	book_id: number;
	created: Generated<Timestamp>;
	id: Generated<number>;
	last_updated: Timestamp;
	review_text: string;
	score: number | null;
	spoiler: boolean;
	user_id: string;
}

export interface UserListBook {
	added: Generated<Timestamp>;
	book_id: number;
	finished: DateString | null;
	last_updated: Timestamp;
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
	sort_order: Generated<number>;
	target: Generated<ListLabelTarget>;
	user_id: string;
}

export interface UserListRelease {
	added: Generated<Timestamp>;
	release_id: number;
	release_status: UserListReleaseStatus;
	user_id: string;
}

export interface UserListSeries {
	added: Generated<Timestamp>;
	finished: DateString | null;
	last_updated: Timestamp;
	notes: string;
	notify_book: boolean;
	score: number | null;
	series_id: number;
	show_upcoming: boolean;
	started: DateString | null;
	user_id: string;
	volumes_read: number | null;
}

export interface UserListSeriesFormat {
	format: ReleaseFormat;
	series_id: number;
	user_id: string;
}

export interface UserListSeriesLabel {
	label_id: number;
	series_id: number;
	user_id: string;
}

export interface UserListSeriesLang {
	lang: Language;
	series_id: number;
	user_id: string;
}

export interface UserListSettings {
	default_book_settings: Generated<Json<Record<string, never>>>;
	default_release_settings: Generated<Json<Record<string, never>>>;
	default_series_settings: Generated<Json<UserListSeriesSettings>>;
	user_id: string;
}

export interface UserSeriesReview {
	created: Generated<Timestamp>;
	id: Generated<number>;
	last_updated: Timestamp;
	review_text: string;
	score: number | null;
	series_id: number;
	spoiler: boolean;
	user_id: string;
	volumes_read: number | null;
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
	email_verification_token: EmailVerificationToken;
	image: Image;
	notification: Notification;
	password_reset_token: PasswordResetToken;
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
	series_tag: SeriesTag;
	series_tag_hist: SeriesTagHist;
	series_title: SeriesTitle;
	series_title_hist: SeriesTitleHist;
	staff: Staff;
	staff_alias: StaffAlias;
	staff_hist: StaffHist;
	staff_alias_hist: StaffAliasHist;
	tag: Tag;
	user_book_review: UserBookReview;
	user_list_book: UserListBook;
	user_list_book_label: UserListBookLabel;
	user_list_label: UserListLabel;
	user_list_release: UserListRelease;
	user_list_series: UserListSeries;
	user_list_series_format: UserListSeriesFormat;
	user_list_series_label: UserListSeriesLabel;
	user_list_series_lang: UserListSeriesLang;
	user_list_settings: UserListSettings;
	user_series_review: UserSeriesReview;
}
