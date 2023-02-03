import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'kysely';

export const load = (async ({ params }) => {
	const id = Number(params.id);
	const personPromise = await db
		.selectFrom('person')
		.selectAll()
		.where('person_id', '=', id)
		.executeTakeFirst();

	const booksPromise = await db
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

	const [person, books] = await Promise.all([personPromise, booksPromise]);

	if (!person) {
		throw error(500);
	}

	return { person, books };
}) satisfies PageServerLoad;
