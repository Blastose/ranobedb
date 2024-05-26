import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod } from 'sveltekit-superforms/adapters';

function addCharacterBetweenString(str: string, char: string) {
	return `${char}${str.split('').join(`${char}`)}${char}`;
}

async function getPublisherByName(name: string, nameAsNumber: number) {
	return await db
		.selectFrom('publisher')
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('publisher.name', 'ilike', name));
			ors.push(eb('publisher.romaji', 'ilike', name));
			if (!isNaN(nameAsNumber)) {
				ors.push(eb('publisher.id', '=', nameAsNumber));
			}
			return eb.or(ors);
		})
		.where('publisher.hidden', '=', false)
		.select(['publisher.name', 'publisher.id', 'publisher.romaji'])
		.limit(16)
		.execute();
}
export type ApiPublisher = Awaited<ReturnType<typeof getPublisherByName>>;

export const GET: RequestHandler = async ({ url }) => {
	const form = await superValidate(url.searchParams, zod(searchNameSchema));

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;
	if (name !== '') name = addCharacterBetweenString(name, '%');

	if (!url.searchParams.get('name')) return json([]);

	const s = await getPublisherByName(name, nameAsNumber);
	return json(s);
};
