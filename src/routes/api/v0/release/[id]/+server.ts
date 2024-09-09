import { db } from '$lib/server/db/db.js';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { DBReleases } from '$lib/server/db/releases/releases';

async function get(params: { id: number; locals: App.Locals }) {
	const { id, locals } = params;
	const dbReleases = DBReleases.fromDB(db, locals.user);
	const release = await dbReleases.getRelease(id).executeTakeFirst();

	if (!release || release.hidden) {
		error(404);
	}

	return { release };
}

export type ReleaseApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ params, locals }) => {
	return json(await get({ id: Number(params.id), locals }));
};
