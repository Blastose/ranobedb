import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { db, pool } from '$lib/server/db/db';
import type { UserRole } from '$lib/db/dbTypes';
import { insertDefaultUserListLabels } from './db/user/user';

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
			role: attributes.role,
			id_numeric: attributes.id_numeric
		};
	}
});

export async function createUser(user: {
	email: string;
	hashed_password: string;
	username: string;
	id: string;
}) {
	await db.transaction().execute(async (trx) => {
		await trx
			.insertInto('auth_user')
			.values({
				username: user.username,
				username_lowercase: user.username.toLowerCase(),
				id: user.id
			})
			.execute();
		await trx
			.insertInto('auth_user_credentials')
			.values({
				email: user.email.toLowerCase(),
				hashed_password: user.hashed_password,
				user_id: user.id
			})
			.execute();

		await insertDefaultUserListLabels(trx, user.id);
	});
}

async function getUserByEmail(email: string) {
	return await db
		.selectFrom('auth_user')
		.innerJoin('auth_user_credentials', 'auth_user.id', 'auth_user_credentials.user_id')
		.where('auth_user_credentials.email', '=', email.toLowerCase())
		.selectAll()
		.executeTakeFirst();
}

async function getUserByUsername(username: string) {
	return await db
		.selectFrom('auth_user')
		.innerJoin('auth_user_credentials', 'auth_user.id', 'auth_user_credentials.user_id')
		.where('auth_user.username_lowercase', '=', username.toLowerCase())
		.selectAll()
		.executeTakeFirst();
}

export async function getUser(usernameemail: string) {
	if (usernameemail.includes('@')) {
		return await getUserByEmail(usernameemail);
	} else {
		return await getUserByUsername(usernameemail);
	}
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
	username_lowercase: string;
	id_numeric: number;
	role: UserRole;
}
