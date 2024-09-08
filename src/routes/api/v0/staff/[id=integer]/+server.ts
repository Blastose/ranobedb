import { db } from '$lib/server/db/db.js';
import { DBStaff } from '$lib/server/db/staff/staff.js';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

async function get(params: { id: number; locals: App.Locals }) {
	const { locals, id } = params;

	const dbStaff = DBStaff.fromDB(db, locals.user);
	const staff = await dbStaff.getStaffOne(id).executeTakeFirst();
	if (!staff || staff.hidden) {
		error(404);
	}

	return { staff };
}

export type StaffOneApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ locals, params }) => {
	return json(await get({ locals, id: Number(params.id) }));
};
