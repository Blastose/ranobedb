import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/zod/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { withSeriesTitleCte } from '$lib/server/db/series/series';

function addCharacterBetweenString(str: string, char: string) {
	return `${char}${str.split('').join(`${char}`)}${char}`;
}

async function getSeriesByTitle(title: string, titleAsNumber: number) {
	return await db
		.with('cte_series', withSeriesTitleCte())
		.selectFrom('cte_series')
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('cte_series.title', 'ilike', title));
			ors.push(eb('cte_series.romaji', 'ilike', title));
			if (!isNaN(titleAsNumber)) {
				ors.push(eb('cte_series.id', '=', titleAsNumber));
			}
			return eb.or(ors);
		})
		.where('cte_series.hidden', '=', false)
		.select(['cte_series.title as name', 'cte_series.id', 'cte_series.romaji'])
		.limit(16)
		.execute();
}
export type ApiBook = Awaited<ReturnType<typeof getSeriesByTitle>>;

export const GET: RequestHandler = async ({ url }) => {
	const form = await superValidate(url.searchParams, zod(searchNameSchema));

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;
	if (name !== '') name = addCharacterBetweenString(name, '%');

	if (!url.searchParams.get('name')) return json([]);

	const s = await getSeriesByTitle(name, nameAsNumber);
	return json(s);
};
