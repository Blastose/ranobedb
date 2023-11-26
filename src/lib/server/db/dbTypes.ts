import type { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Language = 'en' | 'jp';

export type PersonRole = 'artist' | 'author' | 'editor' | 'translator';

export type PublisherRelType = 'imprint' | 'label' | 'subsidiary';

export type ReleaseFormat = 'audio' | 'digital' | 'print';

export type ReleasePublisherType = 'label' | 'publisher';

export type ReleaseType = 'complete' | 'partial';

export type SeriesStatus = 'cancelled' | 'completed' | 'ongoing' | 'unknown';

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type DateString = ColumnType<string, string, string>;

export type UserRole = 'admin' | 'moderator' | 'user';

export interface AuthKey {
	hashed_password: string | null;
	id: string;
	user_id: string;
}

export interface AuthSession {
	active_expires: Int8;
	id: string;
	idle_expires: Int8;
	user_id: string;
}

export interface AuthUser {
	id: string;
	role: Generated<UserRole>;
	username: string;
}

export interface Book {
	description: string;
	description_jp: string | null;
	id: Generated<number>;
	image_id: number | null;
}

export interface BookPersonAlias {
	book_id: number;
	person_alias_id: number;
	role_type: PersonRole;
}

export interface BookTitle {
	book_id: number;
	lang: Language;
	official: boolean;
	romaji: string | null;
	title: string;
}

export interface Image {
	filename: string;
	id: Generated<number>;
	spoiler: boolean;
}

export interface Person {
	bookwalker_id: number | null;
	description: string;
	id: Generated<number>;
}

export interface PersonAlias {
	id: Generated<number>;
	main_alias: boolean;
	name: string;
	person_id: number;
	romaji: string | null;
}

export interface Publisher {
	description: string;
	id: Generated<number>;
	name: string;
	romaji: string | null;
}

export interface PublisherRelation {
	id_child: number;
	id_parent: number;
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
	auth_key: AuthKey;
	auth_session: AuthSession;
	auth_user: AuthUser;
	book: Book;
	book_person_alias: BookPersonAlias;
	book_title: BookTitle;
	image: Image;
	person: Person;
	person_alias: PersonAlias;
	publisher: Publisher;
	publisher_relation: PublisherRelation;
	release: Release;
	release_book: ReleaseBook;
	release_publisher: ReleasePublisher;
	series: Series;
	series_book: SeriesBook;
	series_title: SeriesTitle;
	user_list_book: UserListBook;
	user_list_book_label: UserListBookLabel;
	user_list_label: UserListLabel;
}
