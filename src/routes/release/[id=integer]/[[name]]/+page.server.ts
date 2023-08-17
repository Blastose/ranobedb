import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const release = await db
		.selectFrom('release')
		.selectAll('release')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('publisher')
					.innerJoin('publisher_release', 'publisher_release.publisher_id', 'publisher.id')
					.select(['publisher.id', 'publisher.name'])
					.whereRef('publisher_release.release_id', '=', 'release.id')
			).as('publishers'),
			jsonArrayFrom(
				eb
					.selectFrom('book_info')
					.innerJoin('book_release', 'book_release.book_id', 'book_info.id')
					.selectAll('book_info')
					.whereRef('book_release.release_id', '=', 'release.id')
			).as('books')
		])
		.where('release.id', '=', id)
		.executeTakeFirst();

	if (!release) {
		throw error(404);
	}

	return { release };
}) satisfies PageServerLoad;
