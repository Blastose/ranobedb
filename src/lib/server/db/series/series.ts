import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, type ExpressionBuilder, expressionBuilder, Kysely } from 'kysely';
import { RanobeDB } from '$lib/server/db/db';
import type { DB } from '$lib/db/dbTypes';
import { defaultLangPrio, type LanguagePriority } from '../dbHelpers';
import { withBookTitleCte } from '../books/books';
import type { User } from 'lucia';

function titleCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		cb = cb.when('series_title.lang', '=', prio.lang).then(count);
		count++;
	}
	// Fallback to jp title if there are no matches
	cb = cb.when('series_title.lang', '=', 'ja').then(maxCount);
	return cb.else(maxCount + 1).end();
}

function titleHistCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title_hist'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		cb = cb.when('series_title_hist.lang', '=', prio.lang).then(count);
		count++;
	}
	// Fallback to jp title if there are no matches
	cb = cb.when('series_title_hist.lang', '=', 'ja').then(maxCount);
	return cb.else(maxCount + 1).end();
}

export function withSeriesTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'series'>();

	return () => {
		return eb
			.selectFrom('series')
			.innerJoin('series_title', 'series_title.series_id', 'series.id')
			.innerJoin('series_title as series_title_orig', (join) =>
				join
					.onRef('series_title_orig.series_id', '=', 'series.id')
					.on('series_title_orig.lang', '=', 'ja'),
			)
			.distinctOn('series.id')
			.select([
				'series.id',
				'series.hidden',
				'series.locked',
				'series.publication_status',
				'series.bookwalker_id',
			])
			.select(['series_title.lang', 'series_title.romaji', 'series_title.title'])
			.select(['series_title_orig.title as title_orig', 'series_title_orig.romaji as romaji_orig'])
			.orderBy('series.id')
			.orderBy('series.id')
			.orderBy((eb) => titleCaseBuilder(eb, langPrios ?? defaultLangPrio));
	};
}

export function withSeriesHistTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'series_hist'>();

	return () => {
		return eb
			.selectFrom('series_hist')
			.innerJoin('series_title_hist', 'series_title_hist.change_id', 'series_hist.change_id')
			.innerJoin('series_title_hist as series_title_hist_orig', (join) =>
				join
					.onRef('series_title_hist_orig.change_id', '=', 'series_hist.change_id')
					.on('series_title_hist_orig.lang', '=', 'ja'),
			)
			.distinctOn('series_hist.change_id')
			.select([
				'series_hist.change_id as id',
				'series_hist.bookwalker_id',
				'series_hist.publication_status',
			])
			.select(['series_title_hist.lang', 'series_title_hist.romaji', 'series_title_hist.title'])
			.select([
				'series_title_hist_orig.title as title_orig',
				'series_title_hist_orig.romaji as romaji_orig',
			])
			.orderBy('series_hist.change_id')
			.orderBy('id')
			.orderBy((eb) => titleHistCaseBuilder(eb, langPrios ?? defaultLangPrio));
	};
}

export class DBSeries {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	getSeries() {
		return this.ranobeDB.db
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.title_prefs))
			.selectFrom('cte_series')
			.selectAll('cte_series');
	}
	getSeriesOne(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.title_prefs))
			.selectFrom('cte_series')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
						.whereRef('series_book.series_id', '=', 'cte_series.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'series_book.sort_order',
						])
						.orderBy('sort_order asc'),
				).as('books'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation')
						.innerJoin('cte_series as child_series', 'child_series.id', 'series_relation.id_child')
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'series_relation.relation_type',
						])
						.whereRef('series_relation.id_parent', '=', 'cte_series.id'),
				).as('child_series'),
			])
			.where('cte_series.id', '=', id);
	}

	getSeriesHistOne(options: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series', withSeriesHistTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series_non_hist', withSeriesTitleCte(this.ranobeDB.user?.title_prefs))
			.selectFrom('cte_series')
			.innerJoin('change', 'change.id', 'cte_series.id')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'change.ilock as locked',
				'change.ihid as hidden',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'cte_book.id')
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'series_book_hist.sort_order',
						])
						.orderBy('sort_order asc'),
				).as('books'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation_hist')
						.innerJoin(
							'cte_series_non_hist as child_series',
							'child_series.id',
							'series_relation_hist.id_child',
						)
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'series_relation_hist.relation_type',
						])
						.whereRef('series_relation_hist.change_id', '=', 'change.id'),
				).as('child_series'),
			])
			.where('change.item_id', '=', options.id)
			.where('change.item_name', '=', 'series');

		if (options.revision) {
			query = query.where('change.revision', '=', options.revision);
		} else {
			query = query.orderBy('change.revision desc');
		}
		return query;
	}

	getSeriesOneEdit(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte())
			.with('cte_series', withSeriesTitleCte())
			.selectFrom('cte_series')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
						.whereRef('series_book.series_id', '=', 'cte_series.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'series_book.sort_order',
						])
						.orderBy('sort_order asc'),
				).as('books'),
				jsonArrayFrom(
					eb
						.selectFrom('series_title')
						.whereRef('series_title.series_id', '=', 'cte_series.id')
						.select([
							'series_title.lang',
							'series_title.official',
							'series_title.title',
							'series_title.romaji',
						]),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation')
						.innerJoin('cte_series as child_series', 'child_series.id', 'series_relation.id_child')
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'series_relation.relation_type',
						])
						.whereRef('series_relation.id_parent', '=', 'cte_series.id'),
				).as('child_series'),
			])
			.where('cte_series.id', '=', id);
	}

	getSeriesHistOneEdit(params: { id: number; revision: number }) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series', withSeriesHistTitleCte(this.ranobeDB.user?.title_prefs))
			.with('cte_series_non_hist', withSeriesTitleCte(this.ranobeDB.user?.title_prefs))
			.selectFrom('cte_series')
			.innerJoin('change', 'change.id', 'cte_series.id')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'change.ihid as hidden',
				'change.ilock as locked',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'cte_book.id')
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'series_book_hist.sort_order',
						])
						.orderBy('sort_order asc'),
				).as('books'),
				jsonArrayFrom(
					eb
						.selectFrom('series_title_hist')
						.whereRef('series_title_hist.change_id', '=', 'cte_series.id')
						.select([
							'series_title_hist.lang',
							'series_title_hist.official',
							'series_title_hist.title',
							'series_title_hist.romaji',
						]),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation_hist')
						.innerJoin(
							'cte_series_non_hist as child_series',
							'child_series.id',
							'series_relation_hist.id_child',
						)
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'series_relation_hist.relation_type',
						])
						.whereRef('series_relation_hist.change_id', '=', 'cte_series.id'),
				).as('child_series'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'series')
			.where('change.revision', '=', params.revision);
	}
}

export type Series = InferResult<ReturnType<DBSeries['getSeriesOne']>>[number];
export type SeriesEdit = InferResult<ReturnType<DBSeries['getSeriesOneEdit']>>[number];
