import type { Kysely } from 'kysely';
import type { DB, UserRole } from '$lib/server/db/dbTypes';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { RequestEvent } from '@sveltejs/kit';
import type { DisplayPrefs } from '../zod/schema';
import { getMode } from '$lib/mode/mode';
import { generateRandomString } from '@oslojs/crypto/random';

export function generateIdFromEntropySize(size: number): string {
	const bytes = new Uint8Array(size);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

export function generateUserId(length: number): string {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
	return generateRandomString({ read: (bytes) => crypto.getRandomValues(bytes) }, alphabet, length);
}

export function generateCode(length: number): string {
	const alphabet = '0123456789';
	return generateRandomString({ read: (bytes) => crypto.getRandomValues(bytes) }, alphabet, length);
}

export function generateEntropyId(): string {
	if (getMode() === 'production') {
		return generateIdFromEntropySize(25);
	} else {
		return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
	}
}

export class Lucia {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	generateSessionToken(): string {
		const bytes = new Uint8Array(20);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	async createSession(token: string, userId: string): Promise<Session> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const session: Session = {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		};
		await this.db
			.insertInto('auth_session')
			.values({
				expires_at: session.expiresAt,
				id: session.id,
				user_id: session.userId,
			})
			.execute();
		return session;
	}

	async validateSessionToken(token: string): Promise<SessionValidationResult> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const auth_session_res = await this.db
			.selectFrom('auth_session')
			.innerJoin('auth_user', 'auth_user.id', 'auth_session.user_id')
			.leftJoin('profile_image', 'auth_user.profile_image_id', 'profile_image.id')
			.select([
				'auth_session.id',
				'auth_session.user_id',
				'auth_session.expires_at',
				'auth_user.display_prefs',
				'auth_user.username',
				'auth_user.role',
				'auth_user.id_numeric as user_id_numeric',
				'profile_image.filename as profile_image_filename',
			])
			.where('auth_session.id', '=', sessionId)
			.executeTakeFirst();
		if (auth_session_res === undefined) {
			return { session: null, user: null };
		}
		const session: Session = {
			id: auth_session_res.id,
			userId: auth_session_res.user_id,
			expiresAt: auth_session_res.expires_at,
		};
		const user: User = {
			id: auth_session_res.user_id,
			display_prefs: auth_session_res.display_prefs,
			id_numeric: auth_session_res.user_id_numeric,
			role: auth_session_res.role,
			username: auth_session_res.username,
			profile_image_filename: auth_session_res.profile_image_filename,
		};
		if (Date.now() >= session.expiresAt.getTime()) {
			await this.invalidateSession(session.id);
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
			session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
			await this.db
				.updateTable('auth_session')
				.set({ expires_at: session.expiresAt })
				.where('auth_session.id', '=', session.id)
				.execute();
		}
		return { session, user };
	}

	async invalidateSession(sessionId: string): Promise<void> {
		await this.db.deleteFrom('auth_session').where('auth_session.id', '=', sessionId).execute();
	}

	async invalidateUserSessions(userId: string): Promise<void> {
		await this.db.deleteFrom('auth_session').where('auth_session.user_id', '=', userId).execute();
	}

	setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
		event.cookies.set('auth_session', token, {
			httpOnly: true,
			sameSite: 'lax',
			expires: expiresAt,
			path: '/',
		});
	}

	deleteSessionTokenCookie(event: RequestEvent): void {
		event.cookies.set('auth_session', '', {
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 0,
			path: '/',
		});
	}
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export interface User {
	id: string;
	username: string;
	id_numeric: number;
	role: UserRole;
	display_prefs: DisplayPrefs;
	profile_image_filename?: string | null;
}
