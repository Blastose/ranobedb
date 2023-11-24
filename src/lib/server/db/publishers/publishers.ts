import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import type { InferResult } from 'kysely';

export const getPublishers = db
	.selectFrom('publisher')
	.selectAll('publisher')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('release')
				.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
				.whereRef('release_publisher.publisher_id', '=', 'publisher.id')
				.select([
					'release.title',
					'release_publisher.publisher_type',
					'release.id',
					'release.release_date'
				])
				.orderBy('release.release_date desc')
				.orderBy('release.title')
		).as('releases')
	]);

export type Publishers = InferResult<typeof getPublishers>[number];
