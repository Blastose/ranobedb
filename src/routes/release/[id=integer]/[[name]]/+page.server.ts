import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';
import { error } from '@sveltejs/kit';
import { sql } from 'kysely';

type publisher = { id: number; name: string }[];

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const releasePromise = db
		.selectFrom('release')
		.leftJoin('publisher_release_rel', 'publisher_release_rel.release_id', 'release.id')
		.leftJoin('publisher', 'publisher.id', 'publisher_release_rel.publisher_id')
		.selectAll('release')
		.select([
			sql<publisher>`
      jsonb_agg(DISTINCT jsonb_build_object(
        'name', publisher.name,
        'id', publisher.id))`.as('publishers')
		])
		.groupBy('release.id')
		.orderBy('release.release_date')
		.where('release.id', '=', id)
		.executeTakeFirst();

	const booksPromise = db
		.selectFrom('book_info')
		.innerJoin('book_release_rel', 'book_info.id', 'book_release_rel.book_id')
		.where('book_release_rel.release_id', '=', id)
		.selectAll('book_info')
		.execute();

	const [release, books] = await Promise.all([releasePromise, booksPromise]);

	if (!release) {
		throw error(404);
	}

	return { release, books };
};
