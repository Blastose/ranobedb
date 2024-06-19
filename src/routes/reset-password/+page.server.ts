import { resetPasswordSchema } from '$lib/server/zod/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { db } from '$lib/server/db/db.js';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { encodeHex } from 'oslo/encoding';
import { sha256 } from 'oslo/crypto';
import { isWithinExpirationDate } from 'oslo';
import { lucia } from '$lib/server/lucia.js';
import { Argon2id } from 'oslo/password';

export const load = async ({ locals, setHeaders, url }) => {
	if (locals.user) {
		redirect(302, '/');
	}

	if (!url.searchParams.get('token')) {
		error(404);
	}

	setHeaders({
		'Referrer-Policy': 'no-referrer',
	});

	const form = await superValidate(zod(resetPasswordSchema));

	return { form };
};

export const actions = {
	default: async ({ request, cookies, setHeaders, url }) => {
		setHeaders({
			'Referrer-Policy': 'no-referrer',
		});

		const formData = await request.formData();

		const form = await superValidate(formData, zod(resetPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const verificationToken = url.searchParams.get('token') || '';
		const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));
		const token = await db
			.selectFrom('password_reset_token')
			.selectAll()
			.where('token_hash', '=', tokenHash)
			.executeTakeFirst();
		if (token) {
			await db.deleteFrom('password_reset_token').where('token_hash', '=', tokenHash).execute();
		}

		if (!token || !isWithinExpirationDate(token.expires_at)) {
			return message(
				form,
				{ type: 'error', text: 'Invalid password reset token' },
				{ status: 400 },
			);
		}

		await lucia.invalidateUserSessions(token.user_id);
		const hashed_password = await new Argon2id().hash(form.data.password);

		await db
			.updateTable('auth_user_credentials')
			.where('user_id', '=', token.user_id)
			.set({
				hashed_password: hashed_password,
			})
			.execute();

		await db.transaction().execute(async (trx) => {
			const user = await trx
				.selectFrom('auth_user')
				.where('auth_user.id', '=', token.user_id)
				.selectAll()
				.executeTakeFirstOrThrow();
			await trx
				.updateTable('auth_user_credentials')
				.set({
					email_verified: true,
				})
				.where('auth_user_credentials.user_id', '=', token.user_id)
				.execute();
			if (user.role === 'user') {
				await trx
					.updateTable('auth_user')
					.set({ role: 'editor' })
					.where('auth_user.id', '=', token.user_id)
					.execute();
			}
		});

		flashRedirect(303, '/login', { type: 'success', message: 'Updated password!' }, cookies);
	},
};
