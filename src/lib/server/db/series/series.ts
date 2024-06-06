import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { type InferResult, type ExpressionBuilder, expressionBuilder, Kysely } from 'kysely';
import { RanobeDB } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';
import { type LanguagePriority } from '$lib/server/zod/schema';
import { defaultLangPrio } from '$lib/db/dbConsts';
import { withBookTitleCte } from '../books/books';
import type { User } from 'lucia';

function titleCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title' | 'series'>,
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
						eb('series_title.lang', '=', prio.lang),
						eb('series_title.romaji', 'is not', null),
					]),
				)
				.then(count);
		} else {
			cb = cb.when(eb.and([eb('series_title.lang', '=', prio.lang)])).then(count);
		}
		count++;
	}
	// Fallback to original title if there are no matches
	cb = cb.when('series_title.lang', '=', eb.ref('series.olang')).then(maxCount);
	return cb.else(maxCount + 1).end();
}

function titleHistCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title_hist' | 'series_hist'>,
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
						eb('series_title_hist.lang', '=', prio.lang),
						eb('series_title_hist.romaji', 'is not', null),
					]),
				)
				.then(count);
		} else {
			cb = cb.when(eb.and([eb('series_title_hist.lang', '=', prio.lang)])).then(count);
		}
		count++;
	}
	// Fallback to original title if there are no matches
	cb = cb.when('series_title_hist.lang', '=', eb.ref('series_hist.olang')).then(maxCount);
	return cb.else(maxCount + 1).end();
}

export function withSeriesTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'series'>();

	return () => {
		return eb
			.selectFrom('series')
			.innerJoin('series_title', 'series_title.series_id', 'series.id')
			.leftJoin('series_title as series_title_orig', (join) =>
				join
					.onRef('series_title_orig.series_id', '=', 'series.id')
					.onRef('series_title_orig.lang', '=', 'series.olang'),
			)
			.distinctOn('series.id')
			.select([
				'series.id',
				'series.hidden',
				'series.locked',
				'series.publication_status',
				'series.bookwalker_id',
				'series.description',
				'series.aliases',
				'series.anidb_id',
				'series.start_date',
				'series.end_date',
				'series.web_novel',
				'series.wikidata_id',
				'series.olang',
			])
			.select(['series_title.lang', 'series_title.romaji', 'series_title.title'])
			.select(['series_title_orig.title as title_orig', 'series_title_orig.romaji as romaji_orig'])
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
			.leftJoin('series_title_hist as series_title_hist_orig', (join) =>
				join
					.onRef('series_title_hist_orig.change_id', '=', 'series_hist.change_id')
					.onRef('series_title_hist_orig.lang', '=', 'series_hist.olang'),
			)
			.distinctOn('series_hist.change_id')
			.select([
				'series_hist.change_id as id',
				'series_hist.bookwalker_id',
				'series_hist.publication_status',
				'series_hist.description',
				'series_hist.aliases',
				'series_hist.anidb_id',
				'series_hist.start_date',
				'series_hist.end_date',
				'series_hist.web_novel',
				'series_hist.wikidata_id',
				'series_hist.olang',
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
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_series')
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('book')
						.innerJoin('series_book', 'series_book.series_id', 'cte_series.id')
						.whereRef('series_book.book_id', '=', 'book.id')
						.select('book.id')
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
						.orderBy('series_book.sort_order asc')
						.limit(1),
				).as('book'),
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('series_book as sb3')
						.whereRef('sb3.series_id', '=', 'cte_series.id')
						.select(({ fn }) => [fn.countAll().as('count')]),
				).as('volumes'),
			])
			.select([
				'cte_series.id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'cte_series.olang',
			]);
	}
	getSeriesOne(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
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
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.web_novel',
				'cte_series.wikidata_id',
				'cte_series.olang',
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
							'cte_book.lang',
							'series_book.sort_order',
							'series_book.book_type',
						])
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'cte_book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
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
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.innerJoin('release_book', 'release_book.release_id', 'release_publisher.release_id')
						.innerJoin('release', 'release.id', 'release_book.release_id')
						.innerJoin('series_book', 'series_book.book_id', 'release_book.book_id')
						.where('series_book.series_id', '=', id)
						.distinctOn(['publisher.id', 'release.lang'])
						.select([
							'publisher.id',
							'publisher.name',
							'publisher.romaji',
							'release_publisher.publisher_type',
							'release.lang',
						]),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias')
						.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
						.innerJoin('book_edition', 'book_edition.eid', 'book_staff_alias.eid')
						.innerJoin('series_book', 'series_book.book_id', 'book_staff_alias.book_id')
						.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
						.where('book_edition.lang', 'is', null)
						.where('staff.hidden', '=', false)
						.where('series_book.series_id', '=', id)
						.distinctOn('staff_alias.staff_id')
						.select([
							'book_staff_alias.role_type',
							'staff_alias.name',
							'staff_alias.romaji',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias.note',
						]),
				).as('staff'),
			])
			.where('cte_series.id', '=', id);
	}

	getSeriesHistOne(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_series', withSeriesHistTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with(
				'cte_series_non_hist',
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs),
			)
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
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.web_novel',
				'cte_series.wikidata_id',
				'cte_series.olang',
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
							'cte_book.lang',
							'series_book_hist.book_type',
							'series_book_hist.sort_order',
						])
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'cte_book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
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
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.innerJoin('release_book', 'release_book.release_id', 'release_publisher.release_id')
						.innerJoin('release', 'release.id', 'release_book.release_id')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'release_book.book_id')
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.distinctOn(['publisher.id', 'release.lang'])
						.select([
							'publisher.id',
							'publisher.name',
							'publisher.romaji',
							'release_publisher.publisher_type',
							'release.lang',
						]),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias')
						.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'book_staff_alias.book_id')
						.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
						.where('staff.hidden', '=', false)
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.distinctOn('staff_alias.staff_id')
						.select([
							'book_staff_alias.role_type',
							'staff_alias.name',
							'staff_alias.romaji',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias.note',
						]),
				).as('staff'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'series');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision desc');
		}
		return query;
	}

	getSeriesOneEdit(id: number) {
		return this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_series', withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
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
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.web_novel',
				'cte_series.wikidata_id',
				'cte_series.olang',
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
							'cte_book.lang',
							'series_book.book_type',
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
							'child_series.lang',
							'series_relation.relation_type',
						])
						.whereRef('series_relation.id_parent', '=', 'cte_series.id'),
				).as('child_series'),
			])
			.where('cte_series.id', '=', id);
	}

	getSeriesHistOneEdit(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with('cte_series', withSeriesHistTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.with(
				'cte_series_non_hist',
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs),
			)
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
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.web_novel',
				'cte_series.wikidata_id',
				'cte_series.olang',
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
							'cte_book.lang',
							'series_book_hist.book_type',
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
							'child_series.lang',
							'series_relation_hist.relation_type',
						])
						.whereRef('series_relation_hist.change_id', '=', 'cte_series.id'),
				).as('child_series'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'series');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision desc');
		}
		return query;
	}
}

export type Series = InferResult<ReturnType<DBSeries['getSeriesOne']>>[number];
export type SeriesEdit = InferResult<ReturnType<DBSeries['getSeriesOneEdit']>>[number];
