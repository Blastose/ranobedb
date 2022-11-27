import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ fetch }) => {
	const res = await fetch('/api/auth/logout', { method: 'POST' });
	if (res.status === 200) {
		throw redirect(303, '/login');
	}
	console.log(res.body);
	throw error(500);
};
