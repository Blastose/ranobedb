import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import { sql, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { withBookTitleCte } from '$lib/server/db/books/books';
import type { User } from '$lib/server/lucia/lucia';

async function getBookByTitle(title: string, titleAsNumber: number, user: User | null) {
	return await db
		.with('cte_book', () =>
			withBookTitleCte(user?.display_prefs.title_prefs).where((eb) => {
				const ors: Expression<SqlBool>[] = [];
				ors.push(
					eb(
						'book.id',
						'in',
						eb
							.selectFrom('book_title as bt2')
							.select('bt2.book_id')
							.where((eb) =>
								eb.or([
									eb(eb.val(title), sql.raw('<%'), eb.ref('bt2.title')).$castTo<boolean>(),
									eb(eb.val(title), sql.raw('<%'), eb.ref('bt2.romaji')).$castTo<boolean>(),
								]),
							),
					),
				);
				if (!isNaN(titleAsNumber)) {
					ors.push(eb('book.id', '=', titleAsNumber));
				}
				return eb.or(ors);
			}),
		)
		.selectFrom('cte_book')
		.select(['cte_book.title as name', 'cte_book.id', 'cte_book.romaji', 'cte_book.lang'])
		.where('cte_book.hidden', '=', false)
		.innerJoin('book_title', 'book_title.book_id', 'cte_book.id')
		.select((eb) =>
			eb.fn
				.max(
					eb.fn('greatest', [
						eb.fn('word_similarity', [eb.val(title), eb.ref('book_title.title')]),
						eb.fn('word_similarity', [eb.val(title), eb.ref('book_title.romaji')]),
					]),
				)
				.as('sim_score'),
		)
		.orderBy('sim_score', 'desc')
		.orderBy(
			(eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'),
			(ob) => ob.collate('numeric').asc(),
		)
		.groupBy(['cte_book.id', 'cte_book.title', 'cte_book.romaji', 'cte_book.lang'])
		.limit(16)
		.execute();
}
export type ApiBook = Awaited<ReturnType<typeof getBookByTitle>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	const form = await superValidate(url.searchParams, zod4(searchNameSchema));
	if (!form.valid) {
		return json([]);
	}

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;
	const s = await getBookByTitle(name, nameAsNumber, locals.user);
	return json(s);
};
