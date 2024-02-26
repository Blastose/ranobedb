import { sql, type SelectQueryBuilder } from 'kysely';
import type { Language } from '$lib/db/dbTypes';

// TODO add language priority table/settings
export type LanguagePriority = { lang: Language; romaji: boolean };
export const defaultLangPrio: LanguagePriority[] = [
	{ lang: 'en', romaji: false },
	{ lang: 'ja', romaji: true }
];

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
