import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, expressionBuilder, type ExpressionWrapper } from 'kysely';
import { db } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';
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
	cb = cb.when('book_title.lang', '=', 'jp').then(maxCount);
	cb = cb.else(maxCount + 1).end();

	return cb as ExpressionWrapper<DB, 'book_title', number>;
}

function withBookTitleCte() {
	return db.with('cte_book', (db) =>
		db
			.selectFrom('book')
			.leftJoin('book_title', 'book_title.book_id', 'book.id')
			.leftJoin('book_title as book_title_orig', (join) =>
				join.onRef('book_title_orig.book_id', '=', 'book.id').on('book_title_orig.lang', '=', 'jp')
			)
			.orderBy('book.id')
			.distinctOn('book.id')
			.selectAll('book')
			.select(['book_title.lang', 'book_title.romaji', 'book_title.title'])
			.select(['book_title_orig.title as title_orig', 'book_title_orig.romaji as romaji_orig'])
			.orderBy('book.id')
			.orderBy(titleCaseBuilder(defaultLangPrio))
	);
}

export const getBooks2 = withBookTitleCte()
	.selectFrom('cte_book')
	.leftJoin('image', 'cte_book.image_id', 'image.id')
	.leftJoin('release_book', 'release_book.book_id', 'cte_book.id')
	.leftJoin('release', 'release.id', 'release_book.release_id')
	.select([
		'cte_book.description',
		'cte_book.description_jp',
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
				.selectFrom('person_alias')
				.innerJoin('book_person_alias', 'book_person_alias.person_alias_id', 'person_alias.id')
				.whereRef('book_person_alias.book_id', '=', 'cte_book.id')
				.select(['book_person_alias.role_type', 'person_alias.name', 'person_alias.person_id'])
		).as('persons')
	])
	.groupBy([
		'cte_book.description',
		'cte_book.description_jp',
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
	return withBookTitleCte()
		.selectFrom('cte_book')
		.leftJoin('image', 'cte_book.image_id', 'image.id')
		.select([
			'cte_book.description',
			'cte_book.description_jp',
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
					.selectFrom('person_alias')
					.innerJoin('book_person_alias', 'book_person_alias.person_alias_id', 'person_alias.id')
					.whereRef('book_person_alias.book_id', '=', 'cte_book.id')
					.select(['book_person_alias.role_type', 'person_alias.name', 'person_alias.person_id'])
			).as('persons'),
			jsonArrayFrom(
				eb
					.selectFrom('release')
					.innerJoin('release_book', 'release.id', 'release_book.release_id')
					.whereRef('release_book.book_id', '=', 'cte_book.id')
					.selectAll('release')
			).as('releases')
		])
		.where('cte_book.id', '=', id);
};

export type BookR = InferResult<ReturnType<typeof getBook>>[number];
export type Book = InferResult<typeof getBooks2>[number];
