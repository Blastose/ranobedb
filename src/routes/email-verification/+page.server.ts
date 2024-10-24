import { db } from '$lib/server/db/db.js';
import { EmailVerification } from '$lib/server/email/email.js';
import { isLimited, verifyEmailLimiter } from '$lib/server/rate-limiter/rate-limiter.js';
import { tokenSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
	const { setHeaders, url } = event;
	const urlToken = await superValidate(url, zod(tokenSchema));

	if (!urlToken.valid || !urlToken.data.token) {
		error(404);
	}

	const token_hash = urlToken.data.token;

	setHeaders({
		'Referrer-Policy': 'no-referrer',
	});

	if (await isLimited(verifyEmailLimiter, event)) {
		return error(429, {
			message: 'Too many attempts; try again later',
		});
	}

	const token = await db.transaction().execute(async (trx) => {
		const token = await trx
			.selectFrom('email_verification_token')
			.where('token_hash', '=', token_hash)
			.selectAll()
			.executeTakeFirst();
		if (token) {
			await trx
				.deleteFrom('email_verification_token')
				.where('email_verification_token.token_hash', '=', token_hash)
				.execute();
		}
		return token;
	});

	if (!token || Date.now() >= token.expires_at.getTime()) {
		return error(400);
	}

	const emailVerification = new EmailVerification(db);
	await emailVerification.updateUserEmail(token.user_id, token.new_email);

	return {};
};
