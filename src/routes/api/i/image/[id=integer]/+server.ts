import { db } from '$lib/server/db/db.js';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isSafeInteger(id) || id < 1 || id > 2_000_000) {
		error(404, 'Image not found');
	}

	const image = await db
		.selectFrom('image')
		.selectAll('image')
		.where('image.id', '=', id)
		.executeTakeFirst();

	if (!image) error(404, 'Image not found');

	return json(image);
};
