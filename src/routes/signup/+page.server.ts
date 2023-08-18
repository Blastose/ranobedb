import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import pkg from 'pg';
import { LuciaError } from 'lucia';
const { DatabaseError } = pkg;
import { signupSchema, type Message } from '$lib/zod/schemas2';
import { superValidate, message, setError } from 'sveltekit-superforms/server';

export const load = (async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		throw redirect(303, '/');
	}

	const form = await superValidate<typeof signupSchema, Message>(signupSchema);
	return { form };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate<typeof signupSchema, Message>(request, signupSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const username = form.data.username;
		const password = form.data.password;

		try {
			await auth.createUser({
				userId: crypto.randomUUID(),
				key: {
					providerId: 'email',
					providerUserId: email,
					password: password
				},
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				// Lucia cannot handle default database columns, but we need them for
				// the attribute `reader_id`.
				// Thus, we can @ts-ignore it as long as we don't use the return value of
				// `auth.createUser`, which will try to return the newly created user with
				// the attributes given below (which will be missing `reader_id` in our case).
				attributes: {
					username: username,
					role: 'user'
				}
			});
		} catch (error) {
			if (error instanceof LuciaError && error.message === 'AUTH_DUPLICATE_KEY_ID') {
				return setError(form, 'email', 'Email is already in use. Please use a different email');
			}
			if (error instanceof DatabaseError) {
				if (error.code === '23505' && error.detail?.includes('Key (username)')) {
					return setError(
						form,
						'username',
						'Username is already in use. Please use a different username'
					);
				}
			}
			console.error(error);
			return message(
				form,
				{ status: 'error', text: 'An unknown error has occurred' },
				{ status: 500 }
			);
		}
		return message(form, { status: 'success', text: '' }, { status: 500 });
	}
} satisfies Actions;
