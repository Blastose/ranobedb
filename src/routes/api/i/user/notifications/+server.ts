import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return error(401);
	}

	return json(1);
};
