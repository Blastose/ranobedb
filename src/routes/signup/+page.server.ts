import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import pkg from 'pg';
const { DatabaseError } = pkg;

type FormError = {
	name: string;
	message: string | null;
};

type FormResult = {
	username?: string;
	email?: string;
	usernameError?: FormError;
	emailError?: FormError;
	passwordError?: FormError;
};

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();

		let username = form.get('username')?.toString();
		let email = form.get('email')?.toString();
		const password = form.get('password')?.toString();

		let formData: FormResult = { username };
		let invalidForm = false;
		if (!username) {
			formData = {
				...formData,
				usernameError: { name: 'usernameInvalid', message: 'Username is required' }
			};
			invalidForm = true;
		}
		if (!email) {
			formData = {
				...formData,
				emailError: { name: 'emailInvalid', message: 'Email is required' }
			};
			invalidForm = true;
		}
		if (!password || password.length < 6 || password.length > 255) {
			formData = {
				...formData,
				passwordError: {
					name: 'passwordInvalid',
					message: 'Password must be between 6 and 255 characters'
				}
			};
			invalidForm = true;
		}
		if (invalidForm) {
			return fail(400, { ...formData });
		}

		// username/email cannot be undefined because of the if (!username) check and the return
		// in if (invalidForm), but TypeScript cannot detect this
		username = username as string;
		email = email as string;
		try {
			await auth.createUser('email', email, {
				password,
				attributes: {
					username
				}
			});
		} catch (e) {
			const error = e as Error;
			if (error.message === 'AUTH_DUPLICATE_PROVIDER_ID') {
				return fail(400, {
					...formData,
					emailError: {
						name: 'emailInvalid',
						message: 'Email is already in use. Please use a different email'
					}
				});
			}
			if (error instanceof DatabaseError) {
				if (error.code === '23505' && error.detail?.includes('Key (username)')) {
					return fail(400, {
						...formData,
						usernameError: {
							name: 'usernameInvalid',
							message: 'Username is already in use. Please use a different username'
						}
					});
				}
			}
			console.error(error);
			return fail(500, { error: true });
		}
		return { success: true };
	}
};
