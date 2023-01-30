import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';

export const POST = (async ({ locals }) => {
	const session = await locals.validate();
	if (!session) throw error(401);
	await auth.invalidateSession(session.sessionId);
	locals.setSession(null);
	throw redirect(303, '/login');
}) satisfies RequestHandler;
