import type { RequestHandler } from './$types';
import { db } from '$lib/server/lucia';
import { json } from '@sveltejs/kit';
import { addCharacterBetweenString } from '$lib/util/addCharacterBetweenString';

export const GET = (async ({ url }) => {
	const nameAsNumber = Number(url.searchParams.get('name'));
	let name = String(url.searchParams.get('name') ?? '');
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const people = await db
		.selectFrom('book')
		.select(['id', 'title as name'])
		.where('title', 'ilike', name)
		.orWhere('title_romaji', 'ilike', name)
		.$if(!isNaN(nameAsNumber), (qb) => qb.orWhere('id', '=', nameAsNumber))
		.limit(16)
		.orderBy('title_romaji')
		.execute();

	return json(people);
}) satisfies RequestHandler;
