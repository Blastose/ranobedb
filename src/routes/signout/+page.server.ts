import { type Actions, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';

export const actions: Actions = {
	default: async ({ locals }) => {
		const session = await locals.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId);
		locals.setSession(null);
		throw redirect(303, '/login');
	}
};
