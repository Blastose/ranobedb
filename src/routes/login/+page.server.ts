import { auth } from '$lib/server/lucia';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { loginSchema } from '$lib/zod/schemas';
import type { PageServerLoad } from './$types';
import { LuciaError } from 'lucia-auth';

export const load = (async ({ locals }) => {
	const session = await locals.validate();
	if (session) {
		throw redirect(303, '/');
	}
	return {};
}) satisfies PageServerLoad;

export const actions = {
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
			const key = await auth.useKey('email', email, password);
			const session = await auth.createSession(key.userId);

			locals.setSession(session);
		} catch (error) {
			if (
				error instanceof LuciaError &&
				(error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
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
} satisfies Actions;
