import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'kysely';
import type { PublisherRelType } from '$lib/types/dbTypes';

export const load = (async ({ params }) => {
	const id = Number(params.id);
	const publisherPromise = db
		.selectFrom('publisher')
		.selectAll('publisher')
		.select(
			sql<{ id: number; name: string; type: PublisherRelType }[]>`
			COALESCE(
				JSONB_AGG(
					DISTINCT JSONB_BUILD_OBJECT(
						'id', publisher_child.id,
						'name', publisher_child.name,
						'type', publisher_rel_child.type
					)
				) FILTER (WHERE publisher_child.id IS NOT NULL),
				'[]'::JSONB
			)
		`.as('publisher_children')
		)
		.select(
			sql<{ id: number; name: string; type: PublisherRelType }[]>`
			COALESCE(
				JSONB_AGG(
					DISTINCT JSONB_BUILD_OBJECT(
						'id', publisher_parent.id,
						'name', publisher_parent.name,
						'type', publisher_rel_parent.type
					)
				) FILTER (WHERE publisher_parent.id IS NOT NULL),
				'[]'::JSONB
			)
		`.as('publisher_parents')
		)
		.leftJoin(
			'publisher_rel as publisher_rel_child',
			'publisher_rel_child.id_parent',
			'publisher.id'
		)
		.leftJoin('publisher as publisher_child', 'publisher_rel_child.id_child', 'publisher_child.id')
		.leftJoin(
			'publisher_rel as publisher_rel_parent',
			'publisher_rel_parent.id_child',
			'publisher.id'
		)
		.leftJoin(
			'publisher as publisher_parent',
			'publisher_rel_parent.id_parent',
			'publisher_parent.id'
		)
		.groupBy('publisher.id')
		.where('publisher.id', '=', id)
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
		throw error(404);
	}

	const publisherChildrenGrouped = publisher.publisher_children.reduce(
		(prevGroupedObject, currentChild) => {
			prevGroupedObject[currentChild.type] = [
				...(prevGroupedObject[currentChild.type] || []),
				currentChild
			];
			return prevGroupedObject;
		},
		{} as { [key in PublisherRelType]?: { id: number; name: string; type: PublisherRelType }[] }
	);

	return { publisher, books, publisherChildrenGrouped };
}) satisfies PageServerLoad;
