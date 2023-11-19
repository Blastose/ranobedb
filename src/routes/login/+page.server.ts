import { loginSchema } from '$lib/zod/schema';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import { message, superValidate } from 'sveltekit-superforms/server';
import { LuciaError } from 'lucia';

export const load = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		throw redirect(303, '/');
	}

	const form = await superValidate(loginSchema);

	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, loginSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;

		try {
			const key = await auth.useKey('email', email, password);
			const session = await auth.createSession({
				userId: key.userId,
				attributes: {}
			});
			locals.auth.setSession(session);
		} catch (error) {
			if (
				error instanceof LuciaError &&
				(error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
			) {
				return message(form, { type: 'error', text: 'Invalid login credentials' }, { status: 400 });
			}
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
