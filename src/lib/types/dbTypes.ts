import type { ColumnType, RawBuilder } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export type Timestamp = ColumnType<Date, Date | string | RawBuilder, Date | string | RawBuilder>;

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

export interface DB {
	session: Session;
	user: User;
	reads: Reads;
	book: Book;
}
