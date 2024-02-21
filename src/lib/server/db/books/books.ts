import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, expressionBuilder, type ExpressionWrapper, QueryCreator } from 'kysely';
import { db } from '$lib/server/db/db';
import type { DB } from '$lib/db/dbTypes';
import { defaultLangPrio, type LanguagePriority } from '../dbHelpers';

function titleCaseBuilder(langPrios: LanguagePriority[]) {
	const eb = expressionBuilder<DB, 'book_title'>();

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
	cb = cb.else(maxCount + 1).end();

	return cb as ExpressionWrapper<DB, 'book_title', number>;
}

export function withBookTitleCte() {
	return (eb: QueryCreator<DB>) => {
		return eb
			.selectFrom('book')
			.leftJoin('book_title', 'book_title.book_id', 'book.id')
			.leftJoin('book_title as book_title_orig', (join) =>
				join.onRef('book_title_orig.book_id', '=', 'book.id').on('book_title_orig.lang', '=', 'ja')
			)
			.orderBy('book.id')
			.distinctOn('book.id')
			.selectAll('book')
			.select(['book_title.lang', 'book_title.romaji', 'book_title.title'])
			.select(['book_title_orig.title as title_orig', 'book_title_orig.romaji as romaji_orig'])
			.orderBy('book.id')
			.orderBy(titleCaseBuilder(defaultLangPrio));
	};
}

export function withBookHistTitleCte() {
	return (eb: QueryCreator<DB>) => {
		return eb
			.selectFrom('book_hist')
			.leftJoin('book_title', 'book_title.book_id', 'book_hist.change_id')
			.leftJoin('book_title as book_title_orig', (join) =>
				join
					.onRef('book_title_orig.book_id', '=', 'book_hist.change_id')
					.on('book_title_orig.lang', '=', 'ja')
			)
			.orderBy('book_hist.change_id')
			.distinctOn('book_hist.change_id')
			.select([
				'book_hist.change_id as id',
				'book_hist.description',
				'book_hist.description_ja',
				'book_hist.image_id'
			])
			.select(['book_title.lang', 'book_title.romaji', 'book_title.title'])
			.select(['book_title_orig.title as title_orig', 'book_title_orig.romaji as romaji_orig'])
			.orderBy('id')
			.orderBy(titleCaseBuilder(defaultLangPrio));
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
		.where('cte_book.id', '=', revision);
};

export type BookR = InferResult<ReturnType<typeof getBook>>[number];
export type Book = InferResult<typeof getBooks2>[number];
