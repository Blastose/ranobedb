import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { addCharacterBetweenString } from '$lib/db/match.js';

async function getTagByName(name: string) {
	return await db
		.selectFrom('tag')
		.where('tag.ttype', '!=', 'genre')
		.where('tag.name', 'ilike', name)
		.select(['tag.id', 'tag.name', 'tag.ttype'])
		.limit(16)
		.execute();
}
export type ApiTag = Awaited<ReturnType<typeof getTagByName>>;

export const GET: RequestHandler = async ({ url }) => {
	const form = await superValidate(url.searchParams, zod(searchNameSchema));
	if (!form.valid) {
		return json([]);
	}

	let name = form.data.name;
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const s = await getTagByName(name);
	return json(s);
};
