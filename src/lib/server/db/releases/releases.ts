import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import type { InferResult } from 'kysely';

export const getReleases = db
	.selectFrom('release')
	.selectAll('release')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('publisher')
				.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
				.whereRef('release_publisher.release_id', '=', 'release.id')
				.select(['publisher.name', 'publisher_type'])
		).as('publishers')
	]);

export type Release = InferResult<typeof getReleases>[number];
