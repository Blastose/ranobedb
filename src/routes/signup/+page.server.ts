import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import { signupSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
import { LuciaError } from 'lucia-auth';
const { DatabaseError } = pkg;

export const load = (async ({ locals }) => {
	const session = await locals.validate();
	if (session) {
		throw redirect(303, '/');
	}
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();

		const parsedForm = signupSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				email: form.get('email')?.toString(),
				username: form.get('username')?.toString(),
				password: form.get('password')?.toString(),
				emailError: { message: joinErrors(flattenedErrors.fieldErrors.email) },
				usernameError: { message: joinErrors(flattenedErrors.fieldErrors.username) },
				passwordError: { message: joinErrors(flattenedErrors.fieldErrors.password) }
			});
		}

		const email = parsedForm.data.email;
		const username = parsedForm.data.username;
		const password = parsedForm.data.password;

		try {
			await auth.createUser({
				primaryKey: {
					providerId: 'email',
					providerUserId: email,
					password: password
				},
				attributes: {
					username: username
				}
			});
		} catch (error) {
			if (error instanceof LuciaError && error.message === 'AUTH_DUPLICATE_KEY_ID') {
				return fail(400, {
					email,
					username,
					password,
					emailError: {
						message: 'Email is already in use. Please use a different email'
					}
				});
			}
			if (error instanceof DatabaseError) {
				if (error.code === '23505' && error.detail?.includes('Key (username)')) {
					return fail(400, {
						email,
						username,
						password,
						usernameError: {
							message: 'Username is already in use. Please use a different username'
						}
					});
				}
			}
			console.error(error);
			return fail(500, { error: true });
		}
		return { success: true };
	}
} satisfies Actions;
