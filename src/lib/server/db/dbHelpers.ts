import { sql, type SelectQueryBuilder } from 'kysely';

export function paginationBuilder<O, DB, TB extends keyof DB>(
	query: SelectQueryBuilder<DB, TB, O>,
	pageOptions: { limit: number; page: number },
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
	pageOptions: { limit: number; page: number },
) {
	const pagedQuery = paginationBuilder(query, pageOptions);
	const result = await pagedQuery.execute();
	return result as Array<(typeof result)[number] & { count: string }>;
}

export async function paginationBuilderExecuteWithCountSameQuery<O, DB, TB extends keyof DB>(
	query: SelectQueryBuilder<DB, TB, O>,
	pageOptions: { limit: number; page: number },
) {
	const pagedQuery = paginationBuilder(query, pageOptions);
	const baseResult = await pagedQuery.execute();
	const result = baseResult as Array<(typeof baseResult)[number] & { count: string }>;
	const count = getCountFromPaginatedQuery(result);
	return {
		result,
		count,
		totalPages: Math.ceil(count / pageOptions.limit),
	};
}

interface PageResult<O> {
	result: O[];
	count: number;
	totalPages: number;
}
export async function paginationBuilderExecuteWithCount<O>(
	// We need to use any here because we clear the select for the count
	// The type of the query doesn't matter anyways, since we don't need it for anything
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	query: SelectQueryBuilder<any, any, O>,
	pageOptions: { limit: number; page: number },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	countQuery?: SelectQueryBuilder<any, any, any>,
	useOwnCountQuerySelect?: boolean,
): Promise<PageResult<O>> {
	const [res, total] = await Promise.all([
		query
			.limit(pageOptions.limit)
			.offset(pageOptions.limit * (pageOptions.page - 1))
			.execute(),
		countQuery !== undefined
			? useOwnCountQuerySelect === true
				? countQuery.executeTakeFirst()
				: countQuery
						.select((eb) => [eb.fn.countAll<number>().over().as('count')])
						.executeTakeFirst()
			: query
					.clearSelect()
					.clearOrderBy()
					.select((eb) => [eb.fn.countAll<number>().over().as('count')])
					.executeTakeFirst(),
	]);

	const count = total?.count || 0;
	return {
		result: res,
		count,
		totalPages: Math.ceil(count / pageOptions.limit),
	};
}

// This is needed since when OFFSET is at least as great as the number of rows
// returned from the base query, no rows are returned
export function getCountFromPaginatedQuery(queryResults: { count: string }[]) {
	return Number(queryResults.at(0)?.count) || 0;
}

export function getCurrentVisibilityStatus<T extends { hidden: boolean; locked: boolean }>(
	item: T,
) {
	return {
		hidden: item.hidden,
		locked: item.locked,
	};
}

export function orderNullsLast(direction: 'asc' | 'desc') {
	return sql`${sql.raw(direction)} nulls last`;
}
