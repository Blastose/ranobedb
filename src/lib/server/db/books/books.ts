import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, type ExpressionBuilder, expressionBuilder } from 'kysely';
import { db } from '$lib/server/db/db';
import type { DB } from '$lib/db/dbTypes';
import { defaultLangPrio, type LanguagePriority } from '../dbHelpers';

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
	langPrios: LanguagePriority[]
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

export function withBookTitleCte() {
	const eb = expressionBuilder<DB, 'book'>();
	return () => {
		return eb
			.selectFrom('book')
			.leftJoin('book_title', 'book_title.book_id', 'book.id')
			.leftJoin('book_title as book_title_orig', (join) =>
				join.onRef('book_title_orig.book_id', '=', 'book.id').on('book_title_orig.lang', '=', 'ja')
			)
			.distinctOn('book.id')
			.selectAll('book')
			.select(['book_title.lang', 'book_title.romaji', 'book_title.title'])
			.select(['book_title_orig.title as title_orig', 'book_title_orig.romaji as romaji_orig'])
			.orderBy('book.id')
			.orderBy('book.id')
			.orderBy((eb) => titleCaseBuilder(eb, defaultLangPrio));
	};
}

export function withBookHistTitleCte() {
	const eb = expressionBuilder<DB, 'book_hist'>();
	return () => {
		return eb
			.selectFrom('book_hist')
			.leftJoin('book_title_hist', 'book_title_hist.change_id', 'book_hist.change_id')
			.leftJoin('book_title_hist as book_title_hist_orig', (join) =>
				join
					.onRef('book_title_hist_orig.change_id', '=', 'book_hist.change_id')
					.on('book_title_hist_orig.lang', '=', 'ja')
			)
			.distinctOn('book_hist.change_id')
			.select([
				'book_hist.change_id as id',
				'book_hist.description',
				'book_hist.description_ja',
				'book_hist.image_id'
			])
			.select(['book_title_hist.lang', 'book_title_hist.romaji', 'book_title_hist.title'])
			.select([
				'book_title_hist_orig.title as title_orig',
				'book_title_hist_orig.romaji as romaji_orig'
			])
			.orderBy('book_hist.change_id')
			.orderBy('id')
			.orderBy((eb) => titleHistCaseBuilder(eb, defaultLangPrio));
	};
}

export const getBooks2 = db
	.with('cte_book', withBookTitleCte())
	.selectFrom('cte_book')
	.leftJoin('image', 'cte_book.image_id', 'image.id')
	.leftJoin('release_book', 'release_book.book_id', 'cte_book.id')
	.leftJoin('release', 'release.id', 'release_book.release_id')
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
		'image.filename'
	])
	.select((eb) => eb.fn.min('release.release_date').as('date'))
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('book_title')
				.whereRef('book_title.book_id', '=', 'cte_book.id')
				.selectAll('book_title')
		).as('titles'),
		jsonArrayFrom(
			eb
				.selectFrom('staff_alias')
				.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
				.whereRef('book_staff_alias.book_id', '=', 'cte_book.id')
				.select(['book_staff_alias.role_type', 'staff_alias.name', 'staff_alias.staff_id'])
		).as('staff')
	])
	.groupBy([
		'cte_book.description',
		'cte_book.description_ja',
		'cte_book.id',
		'cte_book.image_id',
		'cte_book.lang',
		'cte_book.romaji',
		'cte_book.romaji_orig',
		'cte_book.title',
		'cte_book.title_orig',
		'image.filename'
	])
	.orderBy((eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'));

export const getBook = (id: number) => {
	return db
		.with('cte_book', withBookTitleCte())
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
			'image.filename'
		])
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('book_title')
					.whereRef('book_title.book_id', '=', 'cte_book.id')
					.selectAll('book_title')
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
						'book_staff_alias.note'
					])
			).as('staff'),
			jsonArrayFrom(
				eb
					.selectFrom('release')
					.innerJoin('release_book', 'release.id', 'release_book.release_id')
					.whereRef('release_book.book_id', '=', 'cte_book.id')
					.selectAll('release')
			).as('releases'),
			jsonArrayFrom(
				eb
					.selectFrom('series')
					.innerJoin('series_book', 'series.id', 'series_book.series_id')
					.whereRef('series_book.book_id', '=', 'cte_book.id')
					.selectAll('series')
			).as('series')
		])
		.where('cte_book.id', '=', id);
};

export const getBookHist = (id: number, revision: number) => {
	return db
		.with('cte_book', withBookHistTitleCte())
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
			'image.filename'
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
						'book_title_hist.title'
					])
			).as('titles'),
			jsonArrayFrom(
				eb
					.selectFrom('staff_alias')
					.innerJoin(
						'book_staff_alias_hist',
						'book_staff_alias_hist.staff_alias_id',
						'staff_alias.id'
					)
					.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
					.where('staff.hidden', '=', false)
					.whereRef('book_staff_alias_hist.change_id', '=', 'cte_book.id')
					.select([
						'book_staff_alias_hist.role_type',
						'staff_alias.name',
						'staff_alias.staff_id',
						'staff_alias.id as staff_alias_id',
						'book_staff_alias_hist.note'
					])
			).as('staff'),
			jsonArrayFrom(
				eb
					.selectFrom('release')
					.innerJoin('release_book', 'release.id', 'release_book.release_id')
					.where('release_book.book_id', '=', id)
					.selectAll('release')
			).as('releases'),
			jsonArrayFrom(
				eb
					.selectFrom('series')
					.innerJoin('series_book', 'series.id', 'series_book.series_id')
					.where('series_book.book_id', '=', id)
					.selectAll('series')
			).as('series')
		])
		.where('change.item_id', '=', id)
		.where('change.item_name', '=', 'book')
		.where('change.revision', '=', revision);
};

export type BookR = InferResult<ReturnType<typeof getBook>>[number];
export type Book = InferResult<typeof getBooks2>[number];
