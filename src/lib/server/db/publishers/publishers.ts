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

export const getPublisher = (id: number) =>
	db
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
			).as('releases'),
			jsonArrayFrom(
				eb
					.selectFrom('publisher_relation')
					.innerJoin(
						'publisher as child_publisher',
						'child_publisher.id',
						'publisher_relation.id_child'
					)
					.select([
						'child_publisher.name',
						'child_publisher.romaji',
						'child_publisher.id',
						'publisher_relation.relation_type'
					])
					.where('publisher_relation.id_parent', '=', id)
			).as('child_publishers')
		])
		.where('publisher.id', '=', id);

export const getPublisherHist = (options: { id: number; revision: number }) =>
	db
		.selectFrom('publisher_hist')
		.innerJoin('change', 'change.id', 'publisher_hist.change_id')
		.select([
			'publisher_hist.change_id as id',
			'publisher_hist.description',
			'publisher_hist.name',
			'publisher_hist.romaji'
		])
		.select(['change.ihid as hidden', 'change.ilock as locked'])
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('release')
					.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
					.where('release_publisher.publisher_id', '=', options.id)
					.select([
						'release.title',
						'release_publisher.publisher_type',
						'release.id',
						'release.release_date'
					])
					.orderBy('release.release_date desc')
					.orderBy('release.title')
			).as('releases'),
			jsonArrayFrom(
				eb
					.selectFrom('publisher_relation_hist')
					.innerJoin(
						'publisher as child_publisher',
						'child_publisher.id',
						'publisher_relation_hist.id_child'
					)
					.select([
						'child_publisher.name',
						'child_publisher.romaji',
						'child_publisher.id',
						'publisher_relation_hist.relation_type'
					])
					.whereRef('publisher_relation_hist.change_id', '=', 'change.id')
			).as('child_publishers')
		])
		.where('change.item_id', '=', options.id)
		.where('change.item_name', '=', 'publisher')
		.where('change.revision', '=', options.revision);

export const getPublisherEdit = (id: number) =>
	db
		.selectFrom('publisher')
		.select([
			'publisher.id',
			'publisher.description',
			'publisher.name',
			'publisher.romaji',
			'publisher.locked',
			'publisher.hidden'
		])
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('publisher_relation')
					.innerJoin('publisher as child_pub', 'child_pub.id', 'publisher_relation.id_child')
					.select(['child_pub.name', 'child_pub.romaji', 'child_pub.id'])
					.select('publisher_relation.relation_type')
					.whereRef('publisher_relation.id_parent', '=', 'publisher.id')
			).as('child_publishers')
		)
		.where('publisher.id', '=', id);

export const getPublisherHistEdit = (params: { id: number; revision: number }) =>
	db
		.selectFrom('publisher_hist')
		.innerJoin('change', 'change.id', 'publisher_hist.change_id')
		.select([
			'publisher_hist.change_id as id',
			'publisher_hist.description',
			'publisher_hist.name',
			'publisher_hist.romaji'
		])
		.select(['change.ihid as hidden', 'change.ilock as locked'])
		.select((eb) =>
			jsonArrayFrom(
				eb
					.selectFrom('publisher_relation_hist')
					.innerJoin('publisher as child_pub', 'child_pub.id', 'publisher_relation_hist.id_child')
					.select(['child_pub.name', 'child_pub.romaji', 'child_pub.id'])
					.select('publisher_relation_hist.relation_type')
					.whereRef('publisher_relation_hist.change_id', '=', 'publisher_hist.change_id')
			).as('child_publishers')
		)
		.where('change.item_id', '=', params.id)
		.where('change.item_name', '=', 'publisher')
		.where('change.revision', '=', params.revision);

export type Publisher = InferResult<ReturnType<typeof getPublisher>>[number];
export type PublisherEdit = InferResult<ReturnType<typeof getPublisherEdit>>[number];
