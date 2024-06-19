import { loginSchema } from '$lib/server/zod/schema';
import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/lucia';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Argon2id } from 'oslo/password';
import { buildUrlFromRedirect } from '$lib/utils/url.js';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { validateTurnstile } from '$lib/server/cf.js';

export const load = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}

	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(loginSchema));

		const turnstileSuccess = await validateTurnstile({ request, body: formData });
		if (!turnstileSuccess) {
			return message(
				form,
				{ type: 'error', text: 'Cloudflare validation failed' },
				{ status: 400 },
			);
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const usernameemail = form.data.usernameemail;
		const password = form.data.password;
		const dbUsers = new DBUsers(db);

		const user = await dbUsers.getUserFull(usernameemail);
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
			...sessionCookie.attributes,
		});

		const redirect = url.searchParams.get('redirect');
		let redirectUrl = '/';
		if (redirect) {
			redirectUrl = buildUrlFromRedirect(url, redirect);
		}
		flashRedirect(
			303,
			redirectUrl,
			{ type: 'success', message: 'Successfully logged in!' },
			cookies,
		);
	},
};
