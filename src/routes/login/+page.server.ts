import { auth } from '$lib/server/lucia';
import { invalid, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const username = form.get('username')?.toString();
		const password = form.get('password')?.toString();
		if (!username || !password || password?.length > 255) {
			return invalid(400, { username, password, error: true });
		}

		try {
			const user = await auth.authenticateUser('username', username, password);
			const session = await auth.createSession(user.userId);
			locals.setSession(session);
		} catch (e) {
			const error = e as Error;
			if (
				error.message === 'AUTH_INVALID_PROVIDER_ID' ||
				error.message === 'AUTH_INVALID_PASSWORD'
			) {
				return invalid(400, {
					username,
					password,
					message: 'Invalid login credentials',
					error: true
				});
			}
			return invalid(500, {
				username,
				password,
				message: 'An unknown error has occurred',
				error: true
			});
		}

		throw redirect(303, '/');
	}
};
