import { DATABASE_URL } from '$env/static/private';
import { Kysely, PostgresDialect, type SelectQueryBuilder, sql } from 'kysely';
import pkg from 'pg';
const { types, Pool } = pkg;
import type { DB } from '$lib/types/dbTypes';

types.setTypeParser(types.builtins.DATE, (value: string) => {
	return value;
});

export const jsonb_agg = <DB, TB extends keyof DB, O = object>(
	qb: SelectQueryBuilder<DB, TB, O>
) => {
	return sql<O[]>`coalesce((select jsonb_agg(x) from (${qb}) x), '[]'::jsonb)`;
};

export const pool = new Pool({
	connectionString: DATABASE_URL
});

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool
	})
});
