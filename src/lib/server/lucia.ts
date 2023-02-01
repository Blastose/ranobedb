import lucia from 'lucia-auth';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';
import kysely from '@lucia-auth/adapter-kysely';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { types, Pool } = pkg;
import type { DB } from '$lib/types/dbTypes';

types.setTypeParser(types.builtins.DATE, (value: string) => {
	return value;
});

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: DATABASE_URL
		})
	})
});

export const auth = lucia({
	adapter: kysely(db, 'pg'),
	env: dev ? 'DEV' : 'PROD',
	transformUserData: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			role: userData.role,
			readerId: userData.reader_id
		};
	},
	generateCustomUserId: () => crypto.randomUUID()
});

export type Auth = typeof auth;
