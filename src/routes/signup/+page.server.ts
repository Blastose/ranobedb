import { createUser, lucia } from '$lib/server/lucia.js';
import { signupSchema } from '$lib/zod/schema';
import { redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals }) => {
	if (locals.user) redirect(302, '/');

	const form = await superValidate(zod(signupSchema));

	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(signupSchema));

		if (!form.valid) {
			return message(form, { text: 'Invalid form', type: 'error' });
		}

		const email = form.data.email;
		const username = form.data.username;
		const password = form.data.password;
		const hashed_password = await new Argon2id().hash(password);
		const userId = generateId(15);

		try {
			await createUser({
				email,
				hashed_password,
				id: userId,
				username
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
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
				{ status: 500 }
			);
		}

		console.log(form);
		return message(form, { text: 'Valid form', type: 'success' });
	}
};
