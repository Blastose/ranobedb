import type { CompiledQuery } from 'kysely';

export function compileQuery(query: CompiledQuery) {
	query.sql, query.parameters;

	let sql = query.sql;
	for (const [index, value] of query.parameters.entries()) {
		const i = index + 1;
		sql = sql.replaceAll(
			new RegExp(`\\$${i}\\b`, 'g'),
			typeof value === 'string' ? `'${value}'` : (value as string),
		);
	}
	return sql;
}
