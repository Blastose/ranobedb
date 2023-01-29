import type { RequestHandler } from './$types';
import { db } from '$lib/server/lucia';
import { json } from '@sveltejs/kit';
import { addCharacterBetweenString } from '$lib/util/addCharacterBetweenString';

export const GET = (async ({ url }) => {
	const nameAsNumber = Number(url.searchParams.get('name'));
	let name = String(url.searchParams.get('name') ?? '');
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const people = await db
		.selectFrom('person')
		.select(['person_id as id', 'person_name as name', 'person_name_romaji as name_romaji'])
		.where('person_name', 'ilike', name)
		.orWhere('person_name_romaji', 'ilike', name)
		.if(!isNaN(nameAsNumber), (qb) => qb.orWhere('person_id', '=', nameAsNumber))
		.limit(16)
		.execute();

	return json(people);
}) satisfies RequestHandler;
