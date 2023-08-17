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
		.selectFrom('book')
		.select(['id', 'title as name'])
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('title', 'ilike', name));
			ors.push(eb('title_romaji', 'ilike', name));
			if (!isNaN(nameAsNumber)) {
				ors.push(eb('id', '=', nameAsNumber));
			}
			return eb.or(ors);
		})
		.limit(16)
		.orderBy('title_romaji')
		.execute();

	return json(people);
}) satisfies RequestHandler;
