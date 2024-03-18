import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, type ExpressionBuilder, expressionBuilder } from 'kysely';
import { db } from '$lib/server/db/db';
import type { DB } from '$lib/db/dbTypes';
import { defaultLangPrio, type LanguagePriority } from '../dbHelpers';
import { withBookTitleCte } from '../books/books';

function titleCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title'>,
	langPrios: LanguagePriority[]
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
	langPrios: LanguagePriority[]
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

export function withSeriesTitleCte() {
	const eb = expressionBuilder<DB, 'series'>();

	return () => {
		return eb
			.selectFrom('series')
			.leftJoin('series_title', 'series_title.series_id', 'series.id')
			.leftJoin('series_title as series_title_orig', (join) =>
				join
					.onRef('series_title_orig.series_id', '=', 'series.id')
					.on('series_title_orig.lang', '=', 'ja')
			)
			.distinctOn('series.id')
			.select([
				'series.id',
				'series.hidden',
				'series.locked',
				'series.publication_status',
				'series.bookwalker_id'
			])
			.select(['series_title.lang', 'series_title.romaji', 'series_title.title'])
			.select(['series_title_orig.title as title_orig', 'series_title_orig.romaji as romaji_orig'])
			.orderBy('series.id')
			.orderBy('series.id')
			.orderBy((eb) => titleCaseBuilder(eb, defaultLangPrio));
	};
}

export function withSeriesHistTitleCte() {
	const eb = expressionBuilder<DB, 'series_hist'>();

	return () => {
		return eb
			.selectFrom('series_hist')
			.leftJoin('series_title_hist', 'series_title_hist.change_id', 'series_hist.change_id')
			.leftJoin('series_title_hist as series_title_hist_orig', (join) =>
				join
					.onRef('series_title_hist_orig.change_id', '=', 'series_hist.change_id')
					.on('series_title_hist_orig.lang', '=', 'ja')
			)
			.distinctOn('series_hist.change_id')
			.select([
				'series_hist.change_id as id',
				'series_hist.bookwalker_id',
				'series_hist.publication_status'
			])
			.select(['series_title_hist.lang', 'series_title_hist.romaji', 'series_title_hist.title'])
			.select([
				'series_title_hist_orig.title as title_orig',
				'series_title_hist_orig.romaji as romaji_orig'
			])
			.orderBy('series_hist.change_id')
			.orderBy('id')
			.orderBy((eb) => titleHistCaseBuilder(eb, defaultLangPrio));
	};
}

export const getSeries = db
	.with('cte_series', withSeriesTitleCte())
	.selectFrom('cte_series')
	.selectAll('cte_series')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('book')
				.innerJoin('series_book', 'series_book.book_id', 'book.id')
				.innerJoin('book_title', 'book_title.book_id', 'book.id')
				.whereRef('series_book.series_id', '=', 'cte_series.id')
				.where('book_title.lang', '=', 'ja')
				.where('book_title.official', '=', true)
				.select(['book_title.title', 'book.id'])
				.orderBy('sort_order desc')
		).as('books'),
		jsonArrayFrom(
			eb
				.selectFrom('series_title')
				.whereRef('series_title.series_id', '=', 'cte_series.id')
				.select(['series_title.title', 'series_title.lang', 'series_title.official'])
		).as('titles')
	]);

export const getSeriesOne = (id: number) =>
	db
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
			'cte_series.title_orig'
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
						'series_book.sort_order'
					])
					.orderBy('sort_order desc')
			).as('books')
		])
		.where('cte_series.id', '=', id);

export const getSeriesHistOne = (options: { id: number; revision: number }) =>
	db
		.with('cte_book', withBookTitleCte())
		.with('cte_series', withSeriesHistTitleCte())
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
			'change.ihid as hidden'
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
						'series_book.sort_order'
					])
					.orderBy('sort_order desc')
			).as('books')
		])
		.where('change.item_id', '=', options.id)
		.where('change.item_name', '=', 'series')
		.where('change.revision', '=', options.revision);

export const getSeriesOneEdit = (id: number) =>
	db
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
			'cte_series.title_orig'
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
						'series_book.sort_order'
					])
					.orderBy('sort_order desc')
			).as('books'),
			jsonArrayFrom(
				eb
					.selectFrom('series_title')
					.whereRef('series_title.series_id', '=', 'cte_series.id')
					.select([
						'series_title.lang',
						'series_title.official',
						'series_title.title',
						'series_title.romaji'
					])
			).as('titles'),
			jsonArrayFrom(
				eb
					.selectFrom('series_relation')
					.innerJoin('cte_series as child_series', 'child_series.id', 'series_relation.id_child')
					.select([
						'child_series.id',
						'child_series.title',
						'child_series.romaji',
						'series_relation.relation_type'
					])
					.whereRef('series_relation.id_parent', '=', 'cte_series.id')
			).as('series')
		])
		.where('cte_series.id', '=', id);

export const getSeriesHistOneEdit = (params: { id: number; revision: number }) =>
	db
		.with('cte_book', withBookTitleCte())
		.with('cte_series', withSeriesHistTitleCte())
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
			'change.ilock as locked'
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
						'series_book_hist.sort_order'
					])
					.orderBy('sort_order desc')
			).as('books'),
			jsonArrayFrom(
				eb
					.selectFrom('series_title_hist')
					.whereRef('series_title_hist.change_id', '=', 'cte_series.id')
					.select([
						'series_title_hist.lang',
						'series_title_hist.official',
						'series_title_hist.title',
						'series_title_hist.romaji'
					])
			).as('titles'),
			jsonArrayFrom(
				eb
					.selectFrom('series_relation_hist')
					.innerJoin(
						'cte_series as child_series',
						'child_series.id',
						'series_relation_hist.id_child'
					)
					.select([
						'child_series.id',
						'child_series.title',
						'child_series.romaji',
						'series_relation_hist.relation_type'
					])
					.whereRef('series_relation_hist.change_id', '=', 'cte_series.id')
			).as('series')
		])
		.where('change.item_id', '=', params.id)
		.where('change.item_name', '=', 'series')
		.where('change.revision', '=', params.revision);

export type Series = InferResult<ReturnType<typeof getSeriesOne>>[number];
export type SeriesEdit = InferResult<ReturnType<typeof getSeriesOneEdit>>[number];
