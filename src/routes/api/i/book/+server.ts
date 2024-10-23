import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { withBookTitleCte } from '$lib/server/db/books/books';
import type { User } from '$lib/server/lucia/lucia';
import { addCharacterBetweenString } from '$lib/db/match.js';

async function getBookByTitle(title: string, titleAsNumber: number, user: User | null) {
	return await db
		.with('cte_book', () => withBookTitleCte(user?.display_prefs.title_prefs))
		.selectFrom('cte_book')
		.select(['cte_book.title as name', 'cte_book.id', 'cte_book.romaji', 'cte_book.lang'])
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(
				eb('cte_book.id', 'in', (eb) =>
					eb
						.selectFrom('book')
						.innerJoin('book_title', (join) => join.onRef('book_title.book_id', '=', 'book.id'))
						.where((eb2) =>
							eb2.or([
								eb2('book_title.title', 'ilike', title),
								eb2('book_title.romaji', 'ilike', title),
							]),
						)
						.select('book.id'),
				),
			);
			if (!isNaN(titleAsNumber)) {
				ors.push(eb('cte_book.id', '=', titleAsNumber));
			}
			return eb.or(ors);
		})
		.where('cte_book.hidden', '=', false)
		.limit(16)
		.execute();
}
export type ApiBook = Awaited<ReturnType<typeof getBookByTitle>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	const form = await superValidate(url.searchParams, zod(searchNameSchema));
	if (!form.valid) {
		return json([]);
	}

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const s = await getBookByTitle(name, nameAsNumber, locals.user);
	return json(s);
};
