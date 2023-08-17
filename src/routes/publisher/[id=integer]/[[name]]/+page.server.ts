import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { sql } from 'kysely';
import type { PublisherRelType } from '$lib/types/dbTypes';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	const publisher = await db
		.selectFrom('publisher')
		.selectAll('publisher')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('publisher as publisher_parent')
					.innerJoin('publisher_relation', 'publisher_relation.id_parent', 'publisher_parent.id')
					.select(['publisher_parent.id', 'publisher_parent.name', 'publisher_relation.type'])
					.distinct()
					.whereRef('publisher_relation.id_child', '=', 'publisher.id')
			).as('publisher_parents'),
			jsonArrayFrom(
				eb
					.selectFrom('publisher as publisher_child')
					.innerJoin('publisher_relation', 'publisher_relation.id_child', 'publisher_child.id')
					.select(['publisher_child.id', 'publisher_child.name', 'publisher_relation.type'])
					.distinct()
					.whereRef('publisher_relation.id_parent', '=', 'publisher.id')
			).as('publisher_children'),
			jsonArrayFrom(
				eb
					.selectFrom('book_info')
					.selectAll('book_info')
					.where(sql`publisher @> '[{"id":${sql.literal(id)}}]'`)
					.orderBy('book_info.title_romaji')
			).as('books')
		])
		.where('publisher.id', '=', id)
		.executeTakeFirst();

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
		{} as {
			[key in PublisherRelType]?: { id: number; name: string; type: PublisherRelType }[];
		}
	);

	return { publisher, publisherChildrenGrouped };
}) satisfies PageServerLoad;
