import { resetPasswordSchema, tokenSchema } from '$lib/server/zod/schema';
import { error, fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { db } from '$lib/server/db/db.js';
import { zod4 } from 'sveltekit-superforms/adapters';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { isLimited, resetPasswordLimiter } from '$lib/server/rate-limiter/rate-limiter.js';
import { Lucia } from '$lib/server/lucia/lucia.js';
import { hashPassword } from '$lib/server/password/hash.js';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export const load = async ({ setHeaders, url }) => {
	const verificationToken = await superValidate(url, zod4(tokenSchema));
	if (!verificationToken.valid || !verificationToken.data.token) {
		error(400);
	}

	setHeaders({
		'Referrer-Policy': 'no-referrer',
	});

	const form = await superValidate(zod4(resetPasswordSchema));

	return { form };
};

export const actions = {
	default: async (event) => {
		const { request, cookies, setHeaders, url } = event;

		setHeaders({
			'Referrer-Policy': 'no-referrer',
		});

		const formData = await request.formData();

		const form = await superValidate(formData, zod4(resetPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const verificationToken = await superValidate(url, zod4(tokenSchema));
		if (!verificationToken.valid || !verificationToken.data.token) {
			return fail(400, { form });
		}

		if (await isLimited(resetPasswordLimiter, event)) {
			return message(
				form,
				{
					type: 'error',
					text: 'Too many attempts; try again later',
				},
				{ status: 429 },
			);
		}

		const tokenHash = encodeHexLowerCase(
			sha256(new TextEncoder().encode(verificationToken.data.token)),
		);
		const token = await db
			.selectFrom('password_reset_token')
			.selectAll()
			.where('token_hash', '=', tokenHash)
			.executeTakeFirst();
		if (token) {
			await db.deleteFrom('password_reset_token').where('token_hash', '=', tokenHash).execute();
		}

		if (!token || Date.now() >= token.expires_at.getTime()) {
			return message(
				form,
				{ type: 'error', text: 'Invalid password reset token' },
				{ status: 400 },
			);
		}

		const lucia = new Lucia(db);
		await lucia.invalidateUserSessions(token.user_id);
		const hashed_password = await hashPassword(form.data.password);

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
