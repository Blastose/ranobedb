import lucia from 'lucia-auth';
import { dev } from '$app/environment';
import { sveltekit } from 'lucia-auth/middleware';
import { default as kysely } from '@lucia-auth/adapter-kysely';
import { db } from '$lib/server/db';

export const auth = lucia({
	adapter: kysely(db, 'pg'),
	env: dev ? 'DEV' : 'PROD',
	transformDatabaseUser: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			role: userData.role,
			readerId: userData.reader_id
		};
	},
	generateCustomUserId: () => crypto.randomUUID(),
	middleware: sveltekit()
});

export type Auth = typeof auth;
