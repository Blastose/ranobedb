import { describe, test, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { Lucia, type Session } from '$lib/server/lucia/lucia';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

describe('lucia', async () => {
	const lucia = new Lucia(db);

	const token = lucia.generateSessionToken();
	let session: Session;

	test('validateSessionToken() returns null on invalid session token', async () => {
		const result = await lucia.validateSessionToken(lucia.generateSessionToken());
		expect(result.session).toBe(null);
	});

	test('createSession() creates a session', async () => {
		session = await lucia.createSession(token, ranobeBot.id);
		expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});

	test('invalidateSession() deletes session', async () => {
		await lucia.invalidateSession(session.id);
		const result = await lucia.validateSessionToken(token);
		expect(result.session).toBe(null);
	});

	test('invalidateUserSessions() deletes all user sessions', async () => {
		await lucia.invalidateUserSessions(ranobeBot.id);
		const result = await db
			.selectFrom('auth_session')
			.where('auth_session.user_id', '=', ranobeBot.id)
			.execute();
		expect(result).toStrictEqual([]);
	});
});
