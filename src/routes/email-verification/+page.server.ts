import { db } from '$lib/server/db/db.js';
import { EmailVerification } from '$lib/server/email/email.js';
import { error } from '@sveltejs/kit';
import { isWithinExpirationDate } from 'oslo';

export const load = async ({ setHeaders, url }) => {
	const urlToken = url.searchParams.get('token');
	if (!urlToken) {
		error(404);
	}

	setHeaders({
		'Referrer-Policy': 'no-referrer',
	});

	const token = await db.transaction().execute(async (trx) => {
		const token = await trx
			.selectFrom('email_verification_token')
			.where('token_hash', '=', urlToken)
			.selectAll()
			.executeTakeFirst();
		if (token) {
			await trx
				.deleteFrom('email_verification_token')
				.where('email_verification_token.token_hash', '=', urlToken)
				.execute();
		}
		return token;
	});

	if (!token || !isWithinExpirationDate(token.expires_at)) {
		return error(400);
	}

	const emailVerification = new EmailVerification(db);
	await emailVerification.updateUserEmail(token.user_id, token.new_email);

	return {};
};
