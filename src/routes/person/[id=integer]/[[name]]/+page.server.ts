import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, jsonb_agg } from '$lib/server/db';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const person = await db
		.selectFrom('person')
		.selectAll('person')
		.select([
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('book_info')
						.selectAll('book_info')
						.innerJoin('person_book_rel', 'person_book_rel.book_id', 'book_info.id')
						.whereRef('person_book_rel.person_id', '=', 'person.person_id')
				).as('books')
		])
		.where('person_id', '=', id)
		.executeTakeFirst();

	if (!person) {
		throw error(500);
	}

	return { person };
}) satisfies PageServerLoad;
