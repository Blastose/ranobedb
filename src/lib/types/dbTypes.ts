import type { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;

export type BigIntColumnType = ColumnType<bigint | number>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type DateString = ColumnType<string, Date | string, Date | string>;

export const BookFormatArray = ['digital', 'print', 'audio'] as const;

export type BookFormat = (typeof BookFormatArray)[number];

export type Language = 'en' | 'jp';

export const PersonRolesArray = ['artist', 'author'] as const;

export type RoleType = (typeof PersonRolesArray)[number];

export type UserRole = 'admin' | 'moderator' | 'user';

export const PublisherRelTypeArray = ['imprint', 'label', 'subsidiary'] as const;

export type PublisherRelType = (typeof PublisherRelTypeArray)[number];

export const ReadingListLabelArray = [
	'Reading',
	'Finished',
	'Plan to read',
	'Dropped',
	'On hold'
] as const;

export type ReadingListLabelType = (typeof ReadingListLabelArray)[number];

export interface AuthKey {
	id: string;
	user_id: string;
	primary_key: boolean;
	hashed_password: string | null;
	expires: BigIntColumnType | null;
}

export interface AuthSession {
	id: string;
	user_id: string;
	active_expires: BigIntColumnType;
	idle_expires: BigIntColumnType;
}

export interface AuthUser {
	reader_id: Generated<number>;
	username: string;
	id: Generated<string>;
	role: Generated<UserRole>;
}

export interface Book {
	id: Generated<number>;
	title: string;
	title_romaji: string | null;
	volume: string | null;
	description: string | null;
	bookbookwalkerlink: string | null;
	cover_image_file_name: string | null;
	description_markdown: string | null;
}

export interface BookInfo {
	id: number;
	title: string;
	title_romaji: string | null;
	volume: string | null;
	description: string | null;
	cover_image_file_name: string | null;
	release_date: string | null;
	publisher: { id: number; name: string }[];
	authors: { id: number; name: string }[];
	artists: { id: number; name: string }[];
}

export interface BookRelease {
	release_id: number;
	book_id: number;
}

export interface BookSeries {
	book_id: number;
	series_id: number;
}

export interface Person {
	id: Generated<number>;
	name: string;
	name_romaji: string | null;
	description: string | null;
	description_markdown: string | null;
}

export interface PersonBook {
	person_id: number;
	book_id: number;
	role: RoleType;
}

export interface Publisher {
	id: Generated<number>;
	name: string;
	name_romaji: string | null;
	description: string | null;
	description_markdown: string | null;
}

export interface PublisherRelation {
	id_parent: number;
	id_child: number;
	type: PublisherRelType;
}

export interface PublisherRelease {
	publisher_id: number;
	release_id: number;
}

export interface ReaderLabels {
	label_name: string;
	book_id: number;
	reader_id: number;
}

export interface ReadingListLabel {
	label_id: Generated<number>;
	label_name: string | null;
}

export interface Reads {
	reader_id: number;
	book_id: number;
	start_date: DateString | null;
	finish_date: DateString | null;
	added_date: Timestamp | null;
}

export interface Release {
	id: Generated<number>;
	name: string;
	name_romaji: string | null;
	format: BookFormat;
	lang: Language;
	release_date: DateString | null;
	isbn13: string | null;
	description: string | null;
}

export interface Series {
	id: Generated<number>;
	title: string;
	title_romaji: string | null;
}

export interface DB {
	auth_key: AuthKey;
	auth_session: AuthSession;
	auth_user: AuthUser;
	book: Book;
	book_info: BookInfo;
	book_release: BookRelease;
	book_series: BookSeries;
	person: Person;
	person_book: PersonBook;
	publisher: Publisher;
	publisher_relation: PublisherRelation;
	publisher_release: PublisherRelease;
	reader_labels: ReaderLabels;
	reading_list_label: ReadingListLabel;
	reads: Reads;
	release: Release;
	series: Series;
}
