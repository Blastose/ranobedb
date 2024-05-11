import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, type ExpressionBuilder, expressionBuilder, Kysely } from 'kysely';
import { RanobeDB } from '$lib/server/db/db';
import type { DB } from '$lib/db/dbTypes';
import { defaultLangPrio, type LanguagePriority } from '../dbHelpers';
import type { User } from 'lucia';
import { withSeriesTitleCte } from '../series/series';

function titleCaseBuilder(eb: ExpressionBuilder<DB, 'book_title'>, langPrios: LanguagePriority[]) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		cb = cb.when('book_title.lang', '=', prio.lang).then(count);
		count++;
	}
	// Fallback to jp title if there are no matches
	cb = cb.when('book_title.lang', '=', 'ja').then(maxCount);
	return cb.else(maxCount + 1).end();
}

function titleHistCaseBuilder(
	eb: ExpressionBuilder<DB, 'book_title_hist'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		cb = cb.when('book_title_hist.lang', '=', prio.lang).then(count);
		count++;
	}
	// Fallback to jp title if there are no matches
	cb = cb.when('book_title_hist.lang', '=', 'ja').then(maxCount);
	return cb.else(maxCount + 1).end();
}

export function withBookTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'book'>();
	return () => {
		return eb
			.selectFrom('book')
			.innerJoin('book_title', 'book_title.book_id', 'book.id')
			.innerJoin('book_title as book_title_orig', (join) =>
				join.onRef('book_title_orig.book_id', '=', 'book.id').on('book_title_orig.lang', '=', 'ja'),
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
			.innerJoin('book_title_hist as book_title_hist_orig', (join) =>
				join
					.onRef('book_title_hist_orig.change_id', '=', 'book_hist.change_id')
					.on('book_title_hist_orig.lang', '=', 'ja'),
			)
			.distinctOn('book_hist.change_id')
			.select([
				'book_hist.change_id as id',
				'book_hist.description',
				'book_hist.description_ja',
				'book_hist.image_id',
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
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_book_2', withBookTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.title_prefs))
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
						.selectAll('book_title'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias')
						.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
						.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
						.where('staff.hidden', '=', false)
						.whereRef('book_staff_alias.book_id', '=', 'cte_book.id')
						.select([
							'book_staff_alias.role_type',
							'staff_alias.name',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias.note',
						]),
				).as('staff'),
				jsonArrayFrom(
					eb
						.selectFrom('release')
						.innerJoin('release_book', 'release.id', 'release_book.release_id')
						.whereRef('release_book.book_id', '=', 'cte_book.id')
						.selectAll('release'),
				).as('releases'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_series')
						.innerJoin('series_book', 'cte_series.id', 'series_book.series_id')
						.whereRef('series_book.book_id', '=', 'cte_book.id')
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
										'image.filename',
										'image.width',
										'image.height',
									])
									.innerJoin('series_book', 'series_book.book_id', 'cte_book_2.id')
									.innerJoin('image', 'image.id', 'cte_book_2.image_id')
									.whereRef('series_book.series_id', '=', 'cte_series.id')
									.orderBy('series_book.sort_order asc'),
							).as('books'),
						)
						.select(['cte_series.title', 'cte_series.romaji', 'cte_series.id']),
				).as('series'),
			])
			.where('cte_book.id', '=', id);
	}

	getBookHist(id: number, revision?: number) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookHistTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_book_2', withBookHistTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.title_prefs))
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
						]),
				).as('titles'),
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
						.whereRef('book_staff_alias_hist.change_id', '=', 'cte_book.id')
						.select([
							'book_staff_alias_hist.role_type',
							'staff_alias.name',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias_hist.note',
						]),
				).as('staff'),
				jsonArrayFrom(
					eb
						.selectFrom('release')
						.innerJoin('release_book', 'release.id', 'release_book.release_id')
						.where('release_book.book_id', '=', id)
						.selectAll('release'),
				).as('releases'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_series')
						.innerJoin('series_book', 'cte_series.id', 'series_book.series_id')
						.where('series_book.book_id', '=', id)
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
										'image.filename',
										'image.width',
										'image.height',
									])
									.innerJoin('series_book', 'series_book.book_id', 'cte_book_2.id')
									.innerJoin('image', 'image.id', 'cte_book_2.image_id')
									.whereRef('series_book.series_id', '=', 'cte_series.id')
									.orderBy('series_book.sort_order asc'),
							).as('books'),
						)
						.select(['cte_series.title', 'cte_series.romaji', 'cte_series.id']),
				).as('series'),
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
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.title_prefs))
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
						.selectAll('book_title'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias')
						.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
						.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
						.where('staff.hidden', '=', false)
						.whereRef('book_staff_alias.book_id', '=', 'cte_book.id')
						.select([
							'book_staff_alias.role_type',
							'staff_alias.name',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias.note',
						]),
				).as('staff'),
			])
			.where('cte_book.id', '=', id);
	}

	getBookHistEdit(id: number, revision: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookHistTitleCte(this.ranobeDB.user?.title_prefs))
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
						]),
				).as('titles'),
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
						.whereRef('book_staff_alias_hist.change_id', '=', 'cte_book.id')
						.select([
							'book_staff_alias_hist.role_type',
							'staff_alias.name',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias_hist.note',
						]),
				).as('staff'),
			])
			.where('change.item_id', '=', id)
			.where('change.item_name', '=', 'book')
			.where('change.revision', '=', revision);
	}

	getBooks() {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.title_prefs))
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
				'image.filename',
				'image.height',
				'image.width',
			])
			.orderBy((eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'));
	}
}

export type BookR = InferResult<ReturnType<DBBooks['getBook']>>[number];
export type Book = InferResult<ReturnType<DBBooks['getBooks']>>[number];
export type BookEdit = InferResult<ReturnType<DBBooks['getBookEdit']>>[number];
