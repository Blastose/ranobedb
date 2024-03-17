import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/zod/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { withBookTitleCte } from '$lib/server/db/books/books';

function addCharacterBetweenString(str: string, char: string) {
	return `${char}${str.split('').join(`${char}`)}${char}`;
}

async function getBookByTitle(title: string, titleAsNumber: number) {
	return await db
		.with('cte_book', withBookTitleCte())
		.selectFrom('cte_book')
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('cte_book.title', 'ilike', title));
			ors.push(eb('cte_book.romaji', 'ilike', title));
			if (!isNaN(titleAsNumber)) {
				ors.push(eb('cte_book.id', '=', titleAsNumber));
			}
			return eb.or(ors);
		})
		.where('cte_book.hidden', '=', false)
		.select(['cte_book.title as name', 'cte_book.id', 'cte_book.romaji'])
		.limit(16)
		.execute();
}
export type ApiBook = Awaited<ReturnType<typeof getBookByTitle>>;

export const GET: RequestHandler = async ({ url }) => {
	const form = await superValidate(url.searchParams, zod(searchNameSchema));

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;
	if (name !== '') name = addCharacterBetweenString(name, '%');

	if (!url.searchParams.get('name')) return json([]);

	const s = await getBookByTitle(name, nameAsNumber);
	return json(s);
};
