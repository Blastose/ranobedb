import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { fail } from 'sveltekit-superforms';
import { db } from '$lib/server/db/db.js';
import type { RequestEvent } from '../$types';

export const refreshpat = async ({ locals }: RequestEvent) => {
	const user = locals.user;
	if (!user) {
		return fail(401);
	}

	try {
		const bytes = new Uint8Array(32);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);

		await db
			.insertInto('auth_user_personal_access_token')
			.values({
				user_id: user.id,
				personal_access_token: token,
				regenerated_at: new Date(),
			})
			.onConflict((oc) =>
				oc.column('user_id').doUpdateSet({
					personal_access_token: token,
					regenerated_at: new Date(),
				}),
			)
			.execute();
		return {
			success: true,
			token: token,
		};
	} catch (e) {
		console.error('Failed to regenerate PAT:', e);
		return fail(500, { message: 'Failed to refresh token.' });
	}
};
