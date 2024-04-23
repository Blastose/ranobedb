import { DATABASE_URL } from '$env/static/private';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { types, Pool } = pkg;
import type { DB } from '$lib/db/dbTypes';

types.setTypeParser(types.builtins.DATE, (value: string) => {
	return value;
});

export const pool = new Pool({
	connectionString: DATABASE_URL,
});

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool,
	}),
});
