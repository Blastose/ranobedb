import lucia from 'lucia-auth';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';
import kysely from '@lucia-auth/adapter-kysely';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/types/dbTypes';

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: DATABASE_URL
		})
	})
});

export const auth = lucia({
	adapter: kysely(db),
	env: dev ? 'DEV' : 'PROD',
	transformUserData: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			readerId: userData.reader_id
		};
	}
});

export type Auth = typeof auth;
