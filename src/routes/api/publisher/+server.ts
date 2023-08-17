import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { addCharacterBetweenString } from '$lib/util/addCharacterBetweenString';
import type { Expression, SqlBool } from 'kysely';

export const GET = (async ({ url }) => {
	const nameAsNumber = Number(url.searchParams.get('name'));
	let name = String(url.searchParams.get('name') ?? '');
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const people = await db
		.selectFrom('publisher')
		.select(['id', 'name', 'name_romaji'])
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('name', 'ilike', name));
			ors.push(eb('name_romaji', 'ilike', name));
			if (!isNaN(nameAsNumber)) {
				ors.push(eb('id', '=', nameAsNumber));
			}
			return eb.or(ors);
		})
		.limit(16)
		.execute();

	return json(people);
}) satisfies RequestHandler;
