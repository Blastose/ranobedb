import pkg from 'pg';
import { redirect } from '@sveltejs/kit';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { Lucia } from '$lib/server/lucia/lucia.js';
import { verifyPasswordHash } from '$lib/server/password/hash.js';
import {
	changePasswordLimiter,
	deleteAccountLimiter,
	isLimited,
} from '$lib/server/rate-limiter/rate-limiter.js';
import { deleteAccountSchema, passwordSchema, usernameSchema } from '$lib/server/zod/schema.js';
import type { RequestEvent } from '../$types';

const { DatabaseError } = pkg;

export const username = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		return fail(401);
	}

	const usernameForm = await superValidate(request, zod4(usernameSchema));

	if (!usernameForm.valid) {
		return fail(400, { usernameForm });
	}

	const newUsername = usernameForm.data.username;
	const password = usernameForm.data.password;
	const dbUsers = new DBUsers(db);

	const user = await dbUsers.getUserFull(locals.user.username);
	if (!user) {
		return message(
			usernameForm,
			{ type: 'error', text: 'Invalid login credentials' },
			{ status: 400 },
		);
	}

	const validPassword = await verifyPasswordHash(user.hashed_password, password);
	if (!validPassword) {
		return message(usernameForm, { type: 'error', text: 'Invalid password' }, { status: 400 });
	}

	try {
		await dbUsers.changeUsername({
			userId: user.id,
			newUsername,
		});
	} catch (error) {
		if (error instanceof DatabaseError) {
			if (
				error.code === '23505' &&
				(error.detail?.includes('Key (username)') ||
					error.detail?.includes('Key (username_lowercase)'))
			) {
				setError(
					usernameForm,
					'username',
					'Username is already in use. Please use a different username',
				);
				return message(
					usernameForm,
					{ type: 'error', text: 'Invalid form entries' },
					{ status: 400 },
				);
			}
		}
		return message(
			usernameForm,
			{ type: 'error', text: 'An unknown error has occurred' },
			{ status: 500 },
		);
	}

	return message(usernameForm, { text: 'Updated username!', type: 'success' });
};

export const password = async (event: RequestEvent) => {
	const { request, locals } = event;
	if (!locals.user) {
		return fail(401);
	}

	const passwordForm = await superValidate(request, zod4(passwordSchema));
	if (!passwordForm.valid) {
		return fail(400, { passwordForm });
	}

	const dbUsers = new DBUsers(db);

	const user = await dbUsers.getUserFull(locals.user.username);
	if (!user) {
		return message(passwordForm, { type: 'error', text: 'Error' }, { status: 400 });
	}

	const currentPassword = passwordForm.data.currentPassword;
	const newPassword = passwordForm.data.newPassword;

	const validPassword = await verifyPasswordHash(user.hashed_password, currentPassword);
	if (!validPassword) {
		return message(passwordForm, { type: 'error', text: 'Invalid password' }, { status: 400 });
	}

	if (await isLimited(changePasswordLimiter, event)) {
		return message(
			passwordForm,
			{ type: 'error', text: 'Too many password change attempts; Try again in 1 minute' },
			{ status: 429 },
		);
	}

	await dbUsers.changePassword({ userId: user.id, newPassword });
	const lucia = new Lucia(db);
	const token = lucia.generateSessionToken();
	const session = await lucia.createSession(token, user.id);
	lucia.setSessionTokenCookie(event, token, session.expiresAt);

	return message(passwordForm, { text: 'Updated password!', type: 'success' });
};

export const delete_account = async (event: RequestEvent) => {
	const { request, locals } = event;
	if (!locals.user) {
		return fail(401);
	}
	if (!locals.session) {
		return fail(401);
	}

	const deleteAccountForm = await superValidate(request, zod4(deleteAccountSchema));
	if (!deleteAccountForm.valid) {
		return fail(400, { deleteAccountForm });
	}

	const dbUsers = new DBUsers(db);

	const user = await dbUsers.getUserFull(locals.user.username);
	if (!user) {
		return message(deleteAccountForm, { type: 'error', text: 'Error' }, { status: 400 });
	}
	if (user.role === 'admin') {
		return message(
			deleteAccountForm,
			{ type: 'error', text: 'Admin accounts cannot be deleted via this interface' },
			{ status: 400 },
		);
	}

	const currentPassword = deleteAccountForm.data.password;
	const validPassword = await verifyPasswordHash(user.hashed_password, currentPassword);
	if (!validPassword) {
		setError(deleteAccountForm, 'password', 'Invalid password');
		return message(deleteAccountForm, { type: 'error', text: 'Invalid password' }, { status: 400 });
	}

	if (await isLimited(deleteAccountLimiter, event)) {
		return message(
			deleteAccountForm,
			{ type: 'error', text: 'Too many incorrect deletion attempts; Try again later' },
			{ status: 429 },
		);
	}

	try {
		await dbUsers.deleteUser({ userId: locals.user.id });
	} catch {
		return message(
			deleteAccountForm,
			{ type: 'error', text: 'An error has occurred' },
			{ status: 400 },
		);
	}
	const lucia = new Lucia(db);
	await lucia.invalidateSession(locals.session.id);
	lucia.deleteSessionTokenCookie(event);

	redirect(302, '/deleted-account');
};
