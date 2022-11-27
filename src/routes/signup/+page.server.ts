import { invalid, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';

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
		const username = form.get('username');
		const password = form.get('password');
		if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
			return invalid(400, {
				message: 'Invalid input'
			});
		}
		try {
			await auth.createUser('username', username, {
				password,
				attributes: {
					username
				}
			});
		} catch (e) {
			const error = e as Error;
			if (error.message === 'AUTH_DUPLICATE_PROVIDER_ID') {
				return invalid(400, {
					message: 'Username already in use'
				});
			}
			console.error(error);
			return invalid(500, {
				message: 'Unknown error occurred'
			});
		}
	}
};
