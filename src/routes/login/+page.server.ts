import { auth } from '$lib/server/lucia';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { loginSchema } from '$lib/zod/schemas';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await request.formData();

		const parsedForm = loginSchema.safeParse(form);
		if (!parsedForm.success) {
			return fail(400, {
				email: form.get('email')?.toString(),
				password: form.get('password')?.toString(),
				error: true
			});
		}

		const email = parsedForm.data.email;
		const password = parsedForm.data.password;

		try {
			const user = await auth.authenticateUser('email', email, password);
			const session = await auth.createSession(user.userId);
			locals.setSession(session);
		} catch (e) {
			const error = e as Error;
			if (
				error.message === 'AUTH_INVALID_PROVIDER_ID' ||
				error.message === 'AUTH_INVALID_PASSWORD'
			) {
				return fail(400, {
					email,
					password,
					message: 'Invalid login credentials',
					error: true
				});
			}
			return fail(500, {
				email,
				password,
				message: 'An unknown error has occurred',
				error: true
			});
		}

		const redirectUrl = url.searchParams.get('redirect');
		if (redirectUrl) {
			throw redirect(303, redirectUrl);
		}
		throw redirect(303, '/');
	}
};
