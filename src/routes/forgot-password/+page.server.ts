import { forgotPasswordSchema } from '$lib/server/zod/schema';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { validateTurnstile } from '$lib/server/cf.js';
import { zod4 } from 'sveltekit-superforms/adapters';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { createPasswordResetToken } from '$lib/server/password/password.js';
import { ORIGIN } from '$env/static/private';
import { EmailBuilder, EmailSender } from '$lib/server/email/sender.js';
import { getMode } from '$lib/mode/mode.js';
import { forgotPasswordLimiter, isLimited } from '$lib/server/rate-limiter/rate-limiter.js';

export const load = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}

	const form = await superValidate(zod4(forgotPasswordSchema));

	return { form };
};

export const actions = {
	default: async (event) => {
		const { request, cookies } = event;
		const formData = await request.formData();

		const form = await superValidate(formData, zod4(forgotPasswordSchema));

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

		if (await isLimited(forgotPasswordLimiter, event)) {
			return message(
				form,
				{ type: 'error', text: 'Too many forgot password attempts; Try again later' },
				{ status: 429 },
			);
		}

		const email = form.data.email;
		const dbUsers = new DBUsers(db);

		const user = await dbUsers.getUserFull(email);

		if (user && user.role !== 'admin') {
			if (user.email_verified) {
				const verificationToken = await createPasswordResetToken(user.user_id);
				const verificationLink = ORIGIN + '/reset-password?token=' + verificationToken;

				if (getMode() !== 'production') {
					console.log(verificationLink);
				} else {
					const builtEmail = new EmailBuilder({ to: email }).createPasswordResetEmail(
						user.username,
						verificationLink,
					);
					await new EmailSender().sendEmail(builtEmail);
				}
			}
		}

		flashRedirect(
			303,
			'/forgot-password/check-email',
			{ type: 'success', message: 'Email sent!' },
			cookies,
		);
	},
};
