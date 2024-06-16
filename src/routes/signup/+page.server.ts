import { lucia } from '$lib/server/lucia.js';
import { DBUsers } from '$lib/server/db/user/user';
import { signupSchema } from '$lib/server/zod/schema';
import { redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db';
import { validateTurnstile } from '$lib/server/cf.js';

export const load = async ({ locals }) => {
	if (locals.user) redirect(302, '/');

	const form = await superValidate(zod(signupSchema));

	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(signupSchema));

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

		const email = form.data.email;
		const username = form.data.username;
		const password = form.data.password;
		const userId = generateId(15);

		const dbUsers = new DBUsers(db);

		try {
			await dbUsers.createUser({
				email,
				password,
				id: userId,
				username,
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
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

		return message(form, { text: 'Valid form', type: 'success' });
	},
};
