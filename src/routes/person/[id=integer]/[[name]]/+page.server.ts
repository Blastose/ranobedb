import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const person = await db
		.selectFrom('person')
		.selectAll('person')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('book_info')
					.selectAll('book_info')
					.innerJoin('person_book', 'person_book.book_id', 'book_info.id')
					.whereRef('person_book.person_id', '=', 'person.id')
					.distinct()
			).as('books')
		])
		.where('id', '=', id)
		.executeTakeFirst();

	if (!person) {
		throw error(500);
	}

	return { person };
}) satisfies PageServerLoad;
