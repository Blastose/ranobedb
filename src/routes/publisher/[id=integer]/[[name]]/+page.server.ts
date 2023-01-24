import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { sql } from 'kysely';

export const load = (async ({ params }) => {
	const id = Number(params.id);
	const publisherPromise = await db
		.selectFrom('publisher')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();

	const booksPromise = await db
		.selectFrom('book_info')
		.selectAll()
		.where(
			sql`
      publisher @> '[{"id":${sql.literal(id)}}]'
    `
		)
		.orderBy('title_romaji')
		.execute();

	const [publisher, books] = await Promise.all([publisherPromise, booksPromise]);

	if (!publisher) {
		throw error(500);
	}

	return { publisher, books };
}) satisfies PageServerLoad;
