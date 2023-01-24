import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';

export const POST = (async ({ fetch, cookies }) => {
	const res = await fetch('/api/auth/logout', { method: 'POST' });
	if (res.status === 200) {
		cookies.set('auth_session', '', { httpOnly: true, maxAge: 0, secure: !dev, path: '/' });
		throw redirect(303, '/login');
	}
	console.log(res.body);
	throw error(500);
}) satisfies RequestHandler;
