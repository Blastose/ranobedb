import type { PageServerLoad } from './$types';
import { db, jsonb_agg } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const release = await db
		.selectFrom('release')
		.selectAll('release')
		.select([
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('publisher')
						.innerJoin(
							'publisher_release_rel',
							'publisher_release_rel.publisher_id',
							'publisher.id'
						)
						.select(['publisher.id', 'publisher.name'])
						.whereRef('publisher_release_rel.release_id', '=', 'release.id')
				).as('publishers'),
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('book_info')
						.innerJoin('book_release_rel', 'book_release_rel.book_id', 'book_info.id')
						.selectAll('book_info')
						.whereRef('book_release_rel.release_id', '=', 'release.id')
				).as('books')
		])
		.where('release.id', '=', id)
		.executeTakeFirst();

	if (!release) {
		throw error(404);
	}

	return { release };
}) satisfies PageServerLoad;
