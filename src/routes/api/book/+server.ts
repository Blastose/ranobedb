import type { RequestHandler } from './$types';
import { db } from '$lib/server/lucia';
import { json } from '@sveltejs/kit';
import { addCharacterBetweenString } from '$lib/util/addCharacterBetweenString';

export const GET = (async ({ url }) => {
	let name = String(url.searchParams.get('name') ?? '');
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const people = await db
		.selectFrom('book')
		.select(['id', 'title as name'])
		.where('title', 'ilike', name)
		.orWhere('title_romaji', 'ilike', name)
		.limit(16)
		.orderBy('title_romaji')
		.execute();

	return json(people);
}) satisfies RequestHandler;
