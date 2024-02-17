import { loginSchema } from '$lib/zod/schema';
import { fail, redirect } from '@sveltejs/kit';
import { getUserByEmail, lucia } from '$lib/server/lucia';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Argon2id } from 'oslo/password';

export const load = async ({ locals }) => {
	if (locals.user) redirect(302, '/');

	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;

		const user = await getUserByEmail(email);
		if (!user) {
			return message(form, { type: 'error', text: 'Invalid login credentials' }, { status: 400 });
		}

		const validPassword = await new Argon2id().verify(user.hashed_password, password);
		if (!validPassword) {
			return message(form, { type: 'error', text: 'Invalid login credentials' }, { status: 400 });
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		console.log(form);
		return message(form, { text: 'Valid form', type: 'success' });
	}
};
