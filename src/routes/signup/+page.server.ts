import { invalid, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import pkg from 'pg';
const { DatabaseError } = pkg;

type FormData = {
	username?: string;
	email?: string;
	usernameInvalid?: boolean;
	usernameTaken?: boolean;
	emailInvalid?: boolean;
	emailTaken?: boolean;
	passwordInvalid?: boolean;
};

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
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

		let formData: FormData = { username };
		let invalidForm = false;
		if (!username) {
			formData = { ...formData, usernameInvalid: true };
			invalidForm = true;
		}
		if (!email) {
			formData = { ...formData, emailInvalid: true };
			invalidForm = true;
		}
		if (!password || password.length < 6 || password.length > 255) {
			formData = { ...formData, passwordInvalid: true };
			invalidForm = true;
		}
		if (invalidForm) {
			return invalid(400, { ...formData });
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
				return invalid(400, { ...formData, emailTaken: true });
			}
			if (error instanceof DatabaseError) {
				if (error.code === '23505' && error.detail?.includes('Key (username)')) {
					return invalid(400, { ...formData, usernameTaken: true });
				}
			}
			console.error(error);
			return invalid(500, { error: true });
		}
		return { success: true };
	}
};
