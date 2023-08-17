import { lucia } from 'lucia';
import { dev } from '$app/environment';
import { sveltekit } from 'lucia/middleware';
import { pg } from '@lucia-auth/adapter-postgresql';
import { pool } from '$lib/server/db';

export const auth = lucia({
	adapter: pg(pool, {
		user: 'auth_user',
		key: 'auth_key',
		session: 'auth_session'
	}),
	env: dev ? 'DEV' : 'PROD',
	getUserAttributes: (userData) => {
		return {
			username: userData.username,
			role: userData.role,
			readerId: userData.reader_id
		};
	},
	middleware: sveltekit()
});

export type Auth = typeof auth;
