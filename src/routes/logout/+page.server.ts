import { db } from '$lib/server/db/db';
import { Lucia } from '$lib/server/lucia/lucia';
import { type Actions, fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async (event) => {
		const { locals } = event;
		if (!locals.session) {
			return fail(401);
		}
		const lucia = new Lucia(db);
		await lucia.invalidateSession(locals.session.id);
		lucia.deleteSessionTokenCookie(event);

		redirect(302, '/login');
	},
};
