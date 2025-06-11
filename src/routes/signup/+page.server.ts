import { DBUsers } from '$lib/server/db/user/user';
import { signupSchema } from '$lib/server/zod/schema';
import { redirect } from '@sveltejs/kit';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db';
import { validateTurnstile } from '$lib/server/cf.js';
import { isLimited, signUpLimiter } from '$lib/server/rate-limiter/rate-limiter.js';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { EmailVerification } from '$lib/server/email/email';
import { generateUserId, Lucia } from '$lib/server/lucia/lucia.js';

export const load = async ({ locals }) => {
	if (locals.user) redirect(302, '/');

	const form = await superValidate(zod4(signupSchema));

	return { form };
};

export const actions = {
	default: async (event) => {
		const { request, cookies } = event;

		const formData = await request.formData();

		const form = await superValidate(formData, zod4(signupSchema));

		const turnstileSuccess = await validateTurnstile({ request, body: formData });
		if (!turnstileSuccess) {
			return message(
				form,
				{ type: 'error', text: 'Cloudflare validation failed' },
				{ status: 400 },
			);
		}

		if (!form.valid) {
			return message(form, { text: 'Invalid form', type: 'error' });
		}

		if (await isLimited(signUpLimiter, event)) {
			return message(
				form,
				{ type: 'error', text: 'Too many sign up attempts per day; Try again tomorrow' },
				{ status: 429 },
			);
		}

		const email = form.data.email;
		const username = form.data.username;
		const password = form.data.password;
		const userId = generateUserId(15);

		const dbUsers = new DBUsers(db);

		try {
			await dbUsers.createUser({
				email,
				password,
				id: userId,
				username,
			});

			const lucia = new Lucia(db);
			const token = lucia.generateSessionToken();
			const session = await lucia.createSession(token, userId);
			lucia.setSessionTokenCookie(event, token, session.expiresAt);
		} catch (error) {
			if (error instanceof DatabaseError) {
				if (error.code === '23505' && error.detail?.includes('Key (email)')) {
					setError(form, 'email', 'Email is already in use. Please use a different email');
					return message(form, { type: 'error', text: 'Invalid form entries' }, { status: 400 });
				}
				if (
					error.code === '23505' &&
					(error.detail?.includes('Key (username)') ||
						error.detail?.includes('Key (username_lowercase)'))
				) {
					setError(form, 'username', 'Username is already in use. Please use a different username');
					return message(form, { type: 'error', text: 'Invalid form entries' }, { status: 400 });
				}
			}
			console.error(error);
			return message(
				form,
				{ type: 'error', text: 'An unknown error has occurred' },
				{ status: 500 },
			);
		}

		const emailVerification = new EmailVerification(db);
		const code = await emailVerification.generateEmailVerificationCode(userId, email);
		await emailVerification.sendVerificationCodeEmail({
			email: email,
			verificationCode: code,
			username: username,
		});

		flashRedirect(
			303,
			`/welcome`,
			{ type: 'success', message: 'Successfully created account!' },
			cookies,
		);
	},
};
