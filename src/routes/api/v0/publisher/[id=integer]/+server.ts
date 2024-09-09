import { db } from '$lib/server/db/db.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

async function get(params: { id: number; locals: App.Locals }) {
	const { locals, id } = params;

	const dbPublishers = DBPublishers.fromDB(db, locals.user);

	const publisherPromise = dbPublishers.getPublisher(id).executeTakeFirst();

	const [publisher] = await Promise.all([publisherPromise]);

	if (!publisher || publisher.hidden) {
		error(404);
	}

	return { publisher };
}

export type PublisherOneApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ locals, params }) => {
	return json(await get({ locals, id: Number(params.id) }));
};
