import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/db.js';
import { error, json } from '@sveltejs/kit';
import { DBUsers } from '$lib/server/db/user/user';

async function fetchFullUserInfo(locals: App.Locals) {
	const dbUsers = new DBUsers(db);
	if (locals.pat) {
		return await dbUsers.getUserByPat(locals.pat);
	}
	if (locals.user) {
		return locals.user;
	}
	return null;
}

export const GET: RequestHandler = async ({ locals }) => {
	const userInfo = await fetchFullUserInfo(locals);
	if (!userInfo) {
		return error(401, { message: 'unauthorized' });
	}
	return json(userInfo);
};
