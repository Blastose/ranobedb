import { insertDefaultUserListLabels } from '$lib/server/db/user/user.js';
import { auth } from '$lib/server/lucia.js';
import { signupSchema } from '$lib/zod/schema';
import { redirect } from '@sveltejs/kit';
import { LuciaError } from 'lucia';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { message, setError, superValidate } from 'sveltekit-superforms/server';

export const load = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		redirect(303, '/');
	}

	const form = await superValidate(signupSchema);

	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, signupSchema);

		if (!form.valid) {
			return message(form, { text: 'Invalid form', type: 'error' });
		}

		const email = form.data.email;
		const username = form.data.username;
		const password = form.data.password;

		try {
			const user = await auth.createUser({
				key: {
					providerId: 'email',
					providerUserId: email,
					password
				},
				attributes: {
					username,
					role: 'user'
				}
			});
			const session = await auth.createSession({ userId: user.userId, attributes: {} });
			await insertDefaultUserListLabels(session.user.userId);
			locals.auth.setSession(session);
		} catch (error) {
			if (error instanceof LuciaError && error.message === 'AUTH_DUPLICATE_KEY_ID') {
				return setError(form, 'email', 'Email is already in use. Please use a different email');
			}
			if (error instanceof DatabaseError) {
				if (error.code === '23505' && error.detail?.includes('Key (username)')) {
					return setError(
						form,
						'username',
						'Username is already in use. Please use a different username'
					);
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
