import { DATABASE_URL } from '$env/static/private';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { types, Pool } = pkg;
import type { DB } from '$lib/server/db/dbTypes';
import type { User } from 'lucia';

// Return pg `date` as string instead of JS date
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

export class RanobeDB {
	db: Kysely<DB>;
	user?: User | null;

	constructor(db: Kysely<DB>, user?: User | null) {
		this.db = db;
		this.user = user;
	}
}
