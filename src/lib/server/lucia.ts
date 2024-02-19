import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { db, pool } from '$lib/server/db/db';
import type { UserRole } from '$lib/db/dbTypes';

const adapter = new NodePostgresAdapter(pool, {
	session: 'auth_session',
	user: 'auth_user'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			email: attributes.email,
			role: attributes.role
		};
	}
});

export async function createUser(user: {
	email: string;
	hashed_password: string;
	username: string;
	id: string;
}) {
	await db
		.insertInto('auth_user')
		.values({
			email: user.email,
			hashed_password: user.hashed_password,
			username: user.username,
			id: user.id
		})
		.execute();
}

export async function getUserByEmail(email: string) {
	return await db
		.selectFrom('auth_user')
		.where('auth_user.email', '=', email)
		.selectAll()
		.executeTakeFirst();
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
	email: string;
	role: UserRole;
}
