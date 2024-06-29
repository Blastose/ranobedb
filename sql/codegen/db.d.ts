import type { ColumnType } from "kysely";

export type DbItem = "book" | "publisher" | "release" | "series" | "staff";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Language = "ar" | "bg" | "ca" | "ck" | "cs" | "da" | "de" | "el" | "en" | "eo" | "es" | "eu" | "fa" | "fi" | "fr" | "ga" | "gd" | "he" | "hi" | "hr" | "hu" | "id" | "it" | "iu" | "ja" | "ko" | "la" | "lt" | "lv" | "mk" | "ms" | "nl" | "no" | "pl" | "pt-br" | "pt-pt" | "ro" | "ru" | "sk" | "sl" | "sr" | "sv" | "ta" | "th" | "tr" | "uk" | "ur" | "vi" | "zh-Hans" | "zh-Hant";

export type PublisherRelType = "imprint" | "parent brand" | "parent company" | "subsidiary";

export type ReleaseFormat = "audio" | "digital" | "print";

export type ReleasePublisherType = "imprint" | "publisher";

export type ReleaseType = "complete" | "omnibus" | "partial";

export type SeriesBookType = "main" | "sub";

export type SeriesRelType = "main story" | "parent story" | "prequel" | "sequel" | "side story" | "spin-off";

export type SeriesStatus = "cancelled" | "completed" | "hiatus" | "ongoing" | "unknown";

export type StaffRole = "artist" | "author" | "editor" | "narrator" | "staff" | "translator";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type UserRole = "admin" | "banned" | "editor" | "moderator" | "user";

export interface AuthSession {
  expires_at: Timestamp;
  id: string;
  user_id: string;
}

export interface AuthUser {
  display_prefs: Generated<Json>;
  id: string;
  id_numeric: Generated<number>;
  joined: Generated<Timestamp>;
  role: Generated<UserRole>;
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
  olang: Language;
  release_date: number;
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
}

export interface BookStaffAlias {
  book_id: number;
  eid: number;
  note: string;
  role_type: StaffRole;
  staff_alias_id: number;
}

export interface BookStaffAliasHist {
  change_id: number;
  eid: number;
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
  bookwalker_id: number | null;
  c_num_books: number;
  description: string;
  end_date: number;
  hidden: boolean;
  id: Generated<number>;
  locked: boolean;
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
  bookwalker_id: number | null;
  change_id: number;
  description: string;
  end_date: number;
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

export interface StaffAliasHist {
  aid: number;
  change_id: number;
  main_alias: boolean;
  name: string;
  romaji: string | null;
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
  series_title: SeriesTitle;
  series_title_hist: SeriesTitleHist;
  staff: Staff;
  staff_alias: StaffAlias;
  staff_alias_hist: StaffAliasHist;
  staff_hist: StaffHist;
  user_list_book: UserListBook;
  user_list_book_label: UserListBookLabel;
  user_list_label: UserListLabel;
}
