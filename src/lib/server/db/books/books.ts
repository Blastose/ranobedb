import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { type InferResult, expressionBuilder, type ExpressionWrapper } from 'kysely';
import { db } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';
import { defaultLangPrio, type LanguagePriority } from '../dbHelpers';

export const getBooks = db
	.selectFrom('book')
	.leftJoin('image', 'book.image_id', 'image.id')
	.selectAll('book')
	.select(['image.filename'])
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('book_title')
				.whereRef('book_title.book_id', '=', 'book.id')
				.selectAll('book_title')
		).as('titles'),
		jsonArrayFrom(
			eb
				.selectFrom('person_alias')
				.innerJoin('book_person_alias', 'book_person_alias.person_alias_id', 'person_alias.id')
				.whereRef('book_person_alias.book_id', '=', 'book.id')
				.select(['book_person_alias.role_type', 'person_alias.name', 'person_alias.person_id'])
		).as('persons')
	]);

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
	.selectAll('cte_book')
	.select(['image.filename'])
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
	.orderBy((eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'));

export type Book = InferResult<typeof getBooks2>[number];
