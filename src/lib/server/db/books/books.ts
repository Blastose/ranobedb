import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { type InferResult, type ExpressionBuilder, expressionBuilder, Kysely } from 'kysely';
import { RanobeDB } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';
import { type LanguagePriority } from '$lib/server/zod/schema';
import { defaultLangPrio } from '$lib/db/dbConsts';
import type { User } from 'lucia';
import { withSeriesTitleCte } from '../series/series';

function titleCaseBuilder(
	eb: ExpressionBuilder<DB, 'book_title' | 'book'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		if (prio.romaji) {
			cb = cb
				.when(
					eb.and([eb('book_title.lang', '=', prio.lang), eb('book_title.romaji', 'is not', null)]),
				)
				.then(count);
		} else {
			cb = cb.when(eb.and([eb('book_title.lang', '=', prio.lang)])).then(count);
		}
		count++;
	}
	// Fallback to original title if there are no matches
	cb = cb.when('book_title.lang', '=', eb.ref('book.olang')).then(maxCount);
	return cb.else(maxCount + 1).end();
}

function titleHistCaseBuilder(
	eb: ExpressionBuilder<DB, 'book_title_hist' | 'book_hist'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		if (prio.romaji) {
			cb = cb
				.when(
					eb.and([
						eb('book_title_hist.lang', '=', prio.lang),
						eb('book_title_hist.romaji', 'is not', null),
					]),
				)
				.then(count);
		} else {
			cb = cb.when(eb.and([eb('book_title_hist.lang', '=', prio.lang)])).then(count);
		}
		count++;
	}
	// Fallback to original title if there are no matches
	cb = cb.when('book_title_hist.lang', '=', eb.ref('book_hist.olang')).then(maxCount);
	return cb.else(maxCount + 1).end();
}

export function withBookTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'book'>();
	return () => {
		return eb
			.selectFrom('book')
			.innerJoin('book_title', 'book_title.book_id', 'book.id')
			.leftJoin('book_title as book_title_orig', (join) =>
				join
					.onRef('book_title_orig.book_id', '=', 'book.id')
					.onRef('book_title_orig.lang', '=', 'book.olang'),
			)
			.distinctOn('book.id')
			.selectAll('book')
			.select(['book_title.lang', 'book_title.romaji', 'book_title.title'])
			.select(['book_title_orig.title as title_orig', 'book_title_orig.romaji as romaji_orig'])
			.orderBy('book.id')
			.orderBy((eb) => titleCaseBuilder(eb, langPrios ?? defaultLangPrio));
	};
}

export function withBookHistTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'book_hist'>();
	return () => {
		return eb
			.selectFrom('book_hist')
			.innerJoin('book_title_hist', 'book_title_hist.change_id', 'book_hist.change_id')
			.leftJoin('book_title_hist as book_title_hist_orig', (join) =>
				join
					.onRef('book_title_hist_orig.change_id', '=', 'book_hist.change_id')
					.onRef('book_title_hist_orig.lang', '=', 'book_hist.olang'),
			)
			.distinctOn('book_hist.change_id')
			.select([
				'book_hist.change_id as id',
				'book_hist.description',
				'book_hist.description_ja',
				'book_hist.image_id',
				'book_hist.release_date',
				'book_hist.olang',
			])
			.select(['book_title_hist.lang', 'book_title_hist.romaji', 'book_title_hist.title'])
			.select([
				'book_title_hist_orig.title as title_orig',
				'book_title_hist_orig.romaji as romaji_orig',
			])
			.orderBy('book_hist.change_id')
			.orderBy('id')
			.orderBy((eb) => titleHistCaseBuilder(eb, langPrios ?? defaultLangPrio));
	};
}

export class DBBooks {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	getBook(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_book_2', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_book')
			.select([
				'cte_book.description',
				'cte_book.description_ja',
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.release_date',
				'cte_book.olang',
				'cte_book.locked',
				'cte_book.hidden',
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('image')
						.selectAll('image')
						.whereRef('image.id', '=', 'cte_book.image_id')
						.limit(1),
				).as('image'),
				jsonArrayFrom(
					eb
						.selectFrom('book_title')
						.whereRef('book_title.book_id', '=', 'cte_book.id')
						.selectAll('book_title')
						.orderBy('book_title.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('book_edition')
						.whereRef('book_edition.book_id', '=', 'cte_book.id')
						.select([
							'book_edition.book_id',
							'book_edition.eid',
							'book_edition.title',
							'book_edition.lang',
						])
						.select((eb) =>
							jsonArrayFrom(
								eb
									.selectFrom('staff_alias')
									.innerJoin(
										'book_staff_alias',
										'book_staff_alias.staff_alias_id',
										'staff_alias.id',
									)
									.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
									.where('staff.hidden', '=', false)
									.whereRef('book_staff_alias.eid', '=', 'book_edition.eid')
									.whereRef('book_staff_alias.book_id', '=', 'cte_book.id')
									.select([
										'book_staff_alias.role_type',
										'staff_alias.name',
										'staff_alias.romaji',
										'staff_alias.staff_id',
										'staff_alias.id as staff_alias_id',
										'book_staff_alias.note',
									])
									.orderBy('book_staff_alias.role_type'),
							).as('staff'),
						),
				).as('editions'),
				jsonArrayFrom(
					eb
						.selectFrom('release')
						.innerJoin('release_book', 'release.id', 'release_book.release_id')
						.selectAll('release')
						.whereRef('release_book.book_id', '=', 'cte_book.id')
						.where('release.hidden', '=', false)
						.orderBy('release.release_date'),
				).as('releases'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_series')
						.innerJoin('series_book', 'cte_series.id', 'series_book.series_id')
						.select((eb) =>
							jsonArrayFrom(
								eb
									.selectFrom('cte_book_2')
									.select([
										'cte_book_2.id',
										'cte_book_2.title',
										'cte_book_2.title_orig',
										'cte_book_2.romaji',
										'cte_book_2.romaji_orig',
										'cte_book_2.lang',
									])
									.select((eb) =>
										jsonObjectFrom(
											eb
												.selectFrom('image')
												.selectAll('image')
												.whereRef('image.id', '=', 'cte_book_2.image_id')
												.limit(1),
										).as('image'),
									)
									.innerJoin('series_book', 'series_book.book_id', 'cte_book_2.id')
									.whereRef('series_book.series_id', '=', 'cte_series.id')
									.where('cte_book_2.hidden', '=', false)
									.orderBy('series_book.sort_order asc'),
							).as('books'),
						)
						.select([
							'cte_series.title',
							'cte_series.title_orig',
							'cte_series.romaji',
							'cte_series.romaji_orig',
							'cte_series.id',
							'cte_series.lang',
						])
						.whereRef('series_book.book_id', '=', 'cte_book.id')
						.where('cte_series.hidden', '=', false),
				).as('series'),
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.innerJoin('release_book', 'release_book.release_id', 'release_publisher.release_id')
						.innerJoin('release', 'release.id', 'release_book.release_id')
						.distinctOn(['publisher.id', 'release.lang', 'release_publisher.publisher_type'])
						.select([
							'publisher.id',
							'publisher.name',
							'publisher.romaji',
							'release_publisher.publisher_type',
							'release.lang',
						])
						.where('release_book.book_id', '=', id)
						.where('publisher.hidden', '=', false)
						.orderBy('release_publisher.publisher_type'),
				).as('publishers'),
			])
			.where('cte_book.id', '=', id);
	}

	getBookHist(id: number, revision?: number) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookHistTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_book_2', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_book')
			.innerJoin('change', 'change.id', 'cte_book.id')
			.select([
				'cte_book.description',
				'cte_book.description_ja',
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.release_date',
				'cte_book.olang',
				'change.ilock as locked',
				'change.ihid as hidden',
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('image')
						.selectAll('image')
						.whereRef('image.id', '=', 'cte_book.image_id')
						.limit(1),
				).as('image'),
				jsonArrayFrom(
					eb
						.selectFrom('book_title_hist')
						.select([
							'book_title_hist.change_id as book_id',
							'book_title_hist.lang',
							'book_title_hist.official',
							'book_title_hist.romaji',
							'book_title_hist.title',
						])
						.whereRef('book_title_hist.change_id', '=', 'cte_book.id')
						.orderBy('book_title_hist.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('book_edition_hist')
						.select([
							'book_edition_hist.change_id as book_id',
							'book_edition_hist.eid',
							'book_edition_hist.title',
							'book_edition_hist.lang',
						])
						.select((eb) =>
							jsonArrayFrom(
								eb
									.selectFrom('staff_alias')
									.innerJoin(
										'book_staff_alias_hist',
										'book_staff_alias_hist.staff_alias_id',
										'staff_alias.id',
									)
									.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
									.where('staff.hidden', '=', false)
									.whereRef('book_staff_alias_hist.eid', '=', 'book_edition_hist.eid')
									.whereRef('book_staff_alias_hist.change_id', '=', 'cte_book.id')
									.select([
										'book_staff_alias_hist.role_type',
										'staff_alias.name',
										'staff_alias.romaji',
										'staff_alias.staff_id',
										'staff_alias.id as staff_alias_id',
										'book_staff_alias_hist.note',
									])
									.orderBy('book_staff_alias_hist.role_type'),
							).as('staff'),
						)
						.whereRef('book_edition_hist.change_id', '=', 'cte_book.id'),
				).as('editions'),
				jsonArrayFrom(
					eb
						.selectFrom('release')
						.innerJoin('release_book', 'release.id', 'release_book.release_id')
						.selectAll('release')
						.where('release_book.book_id', '=', id)
						.where('release.hidden', '=', false)
						.orderBy('release.release_date'),
				).as('releases'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_series')
						.innerJoin('series_book', 'cte_series.id', 'series_book.series_id')
						.select((eb) =>
							jsonArrayFrom(
								eb
									.selectFrom('cte_book_2')
									.select([
										'cte_book_2.id',
										'cte_book_2.title',
										'cte_book_2.title_orig',
										'cte_book_2.romaji',
										'cte_book_2.romaji_orig',
										'cte_book_2.lang',
									])
									.select((eb) =>
										jsonObjectFrom(
											eb
												.selectFrom('image')
												.selectAll('image')
												.whereRef('image.id', '=', 'cte_book_2.image_id')
												.limit(1),
										).as('image'),
									)
									.innerJoin('series_book', 'series_book.book_id', 'cte_book_2.id')
									.whereRef('series_book.series_id', '=', 'cte_series.id')
									.where('cte_book_2.hidden', '=', false)
									.orderBy('series_book.sort_order asc'),
							).as('books'),
						)
						.select([
							'cte_series.title',
							'cte_series.title_orig',
							'cte_series.romaji',
							'cte_series.romaji_orig',
							'cte_series.id',
							'cte_series.lang',
						])
						.where('series_book.book_id', '=', id)
						.where('cte_series.hidden', '=', false),
				).as('series'),
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.innerJoin('release_book', 'release_book.release_id', 'release_publisher.release_id')
						.innerJoin('release', 'release.id', 'release_book.release_id')
						.distinctOn(['publisher.id', 'release.lang', 'release_publisher.publisher_type'])
						.select([
							'publisher.id',
							'publisher.name',
							'publisher.romaji',
							'release_publisher.publisher_type',
							'release.lang',
						])
						.where('release_book.book_id', '=', id)
						.where('publisher.hidden', '=', false)
						.orderBy('release_publisher.publisher_type'),
				).as('publishers'),
			])
			.where('change.item_id', '=', id)
			.where('change.item_name', '=', 'book');

		if (revision) {
			query = query.where('change.revision', '=', revision);
		} else {
			query = query.orderBy('change.revision desc');
		}
		return query;
	}

	getBookEdit(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_book')
			.leftJoin('image', 'cte_book.image_id', 'image.id')
			.select([
				'cte_book.description',
				'cte_book.description_ja',
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.release_date',
				'cte_book.olang',
				'cte_book.locked',
				'cte_book.hidden',
				'image.filename',
				'image.height',
				'image.width',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('book_title')
						.whereRef('book_title.book_id', '=', 'cte_book.id')
						.selectAll('book_title')
						.orderBy('book_title.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('book_edition')
						.whereRef('book_edition.book_id', '=', 'cte_book.id')
						.select([
							'book_edition.book_id',
							'book_edition.eid',
							'book_edition.title',
							'book_edition.lang',
						])
						.select((eb) =>
							jsonArrayFrom(
								eb
									.selectFrom('staff_alias')
									.innerJoin(
										'book_staff_alias',
										'book_staff_alias.staff_alias_id',
										'staff_alias.id',
									)
									.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
									.select([
										'book_staff_alias.role_type',
										'staff_alias.name',
										'staff_alias.romaji',
										'staff_alias.staff_id',
										'staff_alias.id as staff_alias_id',
										'book_staff_alias.note',
									])
									.where('staff.hidden', '=', false)
									.whereRef('book_staff_alias.eid', '=', 'book_edition.eid')
									.whereRef('book_staff_alias.book_id', '=', 'cte_book.id')
									.orderBy('book_staff_alias.role_type'),
							).as('staff'),
						)
						.orderBy('book_edition.eid'),
				).as('editions'),
			])
			.where('cte_book.id', '=', id);
	}

	getBookHistEdit(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookHistTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_book')
			.leftJoin('image', 'cte_book.image_id', 'image.id')
			.innerJoin('change', 'change.id', 'cte_book.id')
			.select([
				'cte_book.description',
				'cte_book.description_ja',
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.release_date',
				'cte_book.olang',
				'change.ilock as locked',
				'change.ihid as hidden',
				'image.filename',
				'image.height',
				'image.width',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('book_title_hist')
						.whereRef('book_title_hist.change_id', '=', 'cte_book.id')
						.select([
							'book_title_hist.change_id as book_id',
							'book_title_hist.lang',
							'book_title_hist.official',
							'book_title_hist.romaji',
							'book_title_hist.title',
						])
						.orderBy('book_title_hist.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('book_edition_hist')
						.whereRef('book_edition_hist.change_id', '=', 'cte_book.id')
						.select([
							'book_edition_hist.change_id as book_id',
							'book_edition_hist.eid',
							'book_edition_hist.title',
							'book_edition_hist.lang',
						])
						.select((eb) =>
							jsonArrayFrom(
								eb
									.selectFrom('staff_alias')
									.innerJoin(
										'book_staff_alias_hist',
										'book_staff_alias_hist.staff_alias_id',
										'staff_alias.id',
									)
									.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
									.select([
										'book_staff_alias_hist.role_type',
										'staff_alias.name',
										'staff_alias.romaji',
										'staff_alias.staff_id',
										'staff_alias.id as staff_alias_id',
										'book_staff_alias_hist.note',
									])
									.where('staff.hidden', '=', false)
									.whereRef('book_staff_alias_hist.eid', '=', 'book_edition_hist.eid')
									.whereRef('book_staff_alias_hist.change_id', '=', 'cte_book.id')
									.orderBy('book_staff_alias_hist.role_type'),
							).as('staff'),
						)
						.orderBy('book_edition_hist.eid'),
				).as('editions'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'book');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision desc');
		}

		return query;
	}

	getBooks() {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_book')
			.select([
				'cte_book.description',
				'cte_book.description_ja',
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.release_date',
				'cte_book.olang',
			])
			.select((eb) =>
				jsonObjectFrom(
					eb
						.selectFrom('image')
						.selectAll('image')
						.whereRef('image.id', '=', 'cte_book.image_id')
						.limit(1),
				).as('image'),
			);
	}
}

export type BookR = InferResult<ReturnType<DBBooks['getBook']>>[number];
export type Book = InferResult<ReturnType<DBBooks['getBooks']>>[number];
export type BookEdit = InferResult<ReturnType<DBBooks['getBookEdit']>>[number];
