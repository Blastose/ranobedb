import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { sql, type InferResult, type SelectQueryBuilder } from 'kysely';
import { db } from './db';

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
				.select(['book_title.title', 'book_title.lang', 'book_title.official'])
		).as('titles'),
		jsonArrayFrom(
			eb
				.selectFrom('person_alias')
				.innerJoin('book_person_alias', 'book_person_alias.person_alias_id', 'person_alias.id')
				.whereRef('book_person_alias.book_id', '=', 'book.id')
				.select(['book_person_alias.role_type', 'person_alias.name', 'person_alias.person_id'])
		).as('persons')
	]);

export function paginationBuilder<O, DB, TB extends keyof DB>(
	query: SelectQueryBuilder<DB, TB, O>,
	pageOptions: { limit: number; page: number }
) {
	let newQuery = query;
	newQuery = newQuery
		.select(sql<string>`count(*) over()`.as('count'))
		.limit(pageOptions.limit)
		.offset(pageOptions.limit * (pageOptions.page - 1));

	return newQuery;
}

export async function paginationBuilderExecute<O, DB, TB extends keyof DB>(
	query: SelectQueryBuilder<DB, TB, O>,
	pageOptions: { limit: number; page: number }
) {
	const pagedQuery = paginationBuilder(query, pageOptions);
	const result = await pagedQuery.execute();
	return result as Array<(typeof result)[number] & { count: string }>;
}

export async function paginationBuilderExecuteWithCount<O, DB, TB extends keyof DB>(
	query: SelectQueryBuilder<DB, TB, O>,
	pageOptions: { limit: number; page: number }
) {
	const pagedQuery = paginationBuilder(query, pageOptions);
	const baseResult = await pagedQuery.execute();
	const result = baseResult as Array<(typeof baseResult)[number] & { count: string }>;
	const count = getCountFromPaginatedQuery(result);
	return {
		result,
		count,
		totalPages: Math.ceil(count / pageOptions.limit)
	};
}

// This is needed since when OFFSET is at least as great as the number of rows
// returned from the base query, no rows are returned
export function getCountFromPaginatedQuery(queryResults: { count: string }[]) {
	return Number(queryResults.at(0)?.count) || 0;
}

export type Book = InferResult<typeof getBooks>[number];
