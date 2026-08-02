import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

async function getUserInfo(locals: App.Locals) {
	if (locals.user) {
		return locals.user;
	}
	return null;
}

export const GET: RequestHandler = async ({ locals }) => {
	const userInfo = await getUserInfo(locals);
	if (!userInfo) {
		return error(401, { message: 'unauthorized' });
	}
	return json(userInfo);
};
