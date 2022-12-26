import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const publisher = await db
		.selectFrom('publisher')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();

	if (!publisher) {
		throw error(500);
	}

	const books = await db
		.selectFrom('book_info')
		.selectAll()
		.where(
			sql`
      publisher @> '[{"id":${sql.literal(id)}}]'
    `
		)
		.orderBy('title_romaji')
		.execute();

	return { publisher, books };
};
