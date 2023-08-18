import { auth } from '$lib/server/lucia';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { LuciaError } from 'lucia';
import { loginSchema, type Message } from '$lib/zod/schemas2';
import { superValidate, message } from 'sveltekit-superforms/server';

export const load = (async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		throw redirect(303, '/');
	}

	const form = await superValidate<typeof loginSchema, Message>(loginSchema);
	return { form };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate<typeof loginSchema, Message>(request, loginSchema);

		if (!form.valid) {
			return message(form, { status: 'error', text: 'Invalid entries in form' }, { status: 400 });
		}

		const email = form.data.email;
		const password = form.data.password;

		try {
			const key = await auth.useKey('email', email, password);
			const session = await auth.createSession({ userId: key.userId, attributes: {} });
			locals.auth.setSession(session);
		} catch (error) {
			if (
				error instanceof LuciaError &&
				(error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
			) {
				return message(
					form,
					{ status: 'error', text: 'Invalid login credentials' },
					{ status: 400 }
				);
			}
			return message(
				form,
				{ status: 'error', text: 'An unknown error has occurred' },
				{ status: 500 }
			);
		}

		const redirectUrl = url.searchParams.get('redirect');
		if (redirectUrl) {
			throw redirect(303, redirectUrl);
		}
		throw redirect(303, '/');
	}
} satisfies Actions;
