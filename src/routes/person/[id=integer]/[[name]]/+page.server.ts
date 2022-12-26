import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const person = await db
		.selectFrom('person')
		.selectAll()
		.where('person_id', '=', id)
		.executeTakeFirst();

	if (!person) {
		throw error(500);
	}

	const books = await db
		.selectFrom('book_info')
		.selectAll()
		.where(
			sql`
      book_info.artists @> '[{"id":${sql.literal(id)}}]'
      OR 
      book_info.authors @> '[{"id":${sql.literal(id)}}]'
    `
		)
		.orderBy('title_romaji')
		.execute();

	return { person, books };
};
