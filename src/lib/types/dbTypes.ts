import type { ColumnType, RawBuilder } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export type Timestamp = ColumnType<Date, Date | string | RawBuilder, Date | string | RawBuilder>;

export type BookFormat = 'digital' | 'print';

export type Language = 'en' | 'jp';

export interface Session {
	expires: Int8;
	id: string;
	idle_expires: Int8;
	user_id: string;
}

export interface User {
	hashed_password: string | null;
	id: Generated<string>;
	provider_id: string;
	username: string;
	reader_id: Generated<number>;
}

export interface Reads {
	added_date: Timestamp | null;
	book_id: number;
	finish_date: Timestamp | null;
	reader_id: number;
	start_date: Timestamp | null;
}

export interface Book {
	book_label: string | null;
	book_publisher: string | null;
	bookbookwalkerlink: string | null;
	cover_image_file_name: string | null;
	description: string | null;
	id: number;
	release_date: Timestamp | null;
	title: string;
	title_romaji: string | null;
	volume: string | null;
}

export interface BookInfo {
	id: number;
	title: string;
	title_romaji: string | null;
	volume: string | null;
	description: string | null;
	cover_image_file_name: string | null;
	release_date: Date | null;
	publisher: { id: number; name: string }[];
	authors: { id: number; name: string }[];
	artists: { id: number; name: string }[];
}

export interface BookRelease {
	name: string;
	id: number;
	book_id: number;
	lang: Language;
	release_date: Date | null;
	format: BookFormat;
	isbn13: string | null;
	publisher: string[];
}

export interface BookSameSeries {
	series_id: number;
	series_title: string;
	book_id: number;
	orig_book_id: number;
	title: string;
	cover_image_file_name: string | null;
}

export interface BookSeries {
	id: number;
	title: string;
	title_romaji: string | null;
}

export interface PartOf {
	book_id: number;
	series_id: number;
}

export interface Person {
	person_description: string | null;
	person_id: Generated<number>;
	person_name: string;
	person_name_romaji: string | null;
}

export interface Publisher {
	description: string | null;
	id: Generated<number>;
	name: string;
	name_romaji: string | null;
}

export interface PublisherReleaseRel {
	publisher_id: number;
	release_id: number;
}

export interface ReaderLabels {
	book_id: number;
	label_name: string;
	reader_id: number;
}

export interface Release {
	description: string | null;
	format: BookFormat;
	id: Generated<number>;
	isbn13: string | null;
	lang: Language;
	name: string;
	name_romaji: string | null;
	release_date: Timestamp | null;
}

export interface BookReleaseRel {
	book_id: number;
	release_id: number;
}

export interface DB {
	session: Session;
	user: User;
	reads: Reads;
	reader_labels: ReaderLabels;
	person: Person;
	publisher: Publisher;
	publisher_release_rel: PublisherReleaseRel;
	book: Book;
	book_info: BookInfo;
	book_release: BookRelease;
	book_same_series: BookSameSeries;
	book_series: BookSeries;
	part_of: PartOf;
	release: Release;
	book_release_rel: BookReleaseRel;
}
