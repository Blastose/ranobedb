import type { ColumnType } from "kysely";

export type DbItem = "book" | "publisher" | "release" | "series" | "staff";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Language = "ar" | "bg" | "ca" | "ck" | "cs" | "da" | "de" | "el" | "en" | "eo" | "es" | "eu" | "fa" | "fi" | "fr" | "ga" | "gd" | "he" | "hi" | "hr" | "hu" | "id" | "it" | "iu" | "ja" | "ko" | "la" | "lt" | "lv" | "mk" | "ms" | "nl" | "no" | "pl" | "pt-br" | "pt-pt" | "ro" | "ru" | "sk" | "sl" | "sr" | "sv" | "ta" | "th" | "tr" | "uk" | "ur" | "vi" | "zh-Hans" | "zh-Hant";

export type PublisherRelType = "imprint" | "label" | "subsidiary";

export type ReleaseFormat = "audio" | "digital" | "print";

export type ReleasePublisherType = "label" | "publisher";

export type ReleaseType = "complete" | "partial";

export type SeriesStatus = "cancelled" | "completed" | "ongoing" | "unknown";

export type StaffRole = "artist" | "author" | "editor" | "translator";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type UserRole = "admin" | "banned" | "editor" | "moderator" | "unverified" | "user";

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

export interface Staff {
  bookwalker_id: number | null;
  description: string;
  id: Generated<number>;
}

export interface StaffAlias {
  id: Generated<number>;
  main_alias: boolean;
  name: string;
  romaji: string | null;
  staff_id: number;
}

export interface UserListBook {
  added: Generated<Timestamp>;
  book_id: number;
  finished: Timestamp | null;
  notes: string;
  score: number | null;
  started: Timestamp | null;
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
  publisher_relation: PublisherRelation;
  release: Release;
  release_book: ReleaseBook;
  release_publisher: ReleasePublisher;
  series: Series;
  series_book: SeriesBook;
  series_title: SeriesTitle;
  staff: Staff;
  staff_alias: StaffAlias;
  user_list_book: UserListBook;
  user_list_book_label: UserListBookLabel;
  user_list_label: UserListLabel;
}
