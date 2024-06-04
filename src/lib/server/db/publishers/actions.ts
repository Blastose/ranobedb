import type { publisherSchema } from '$lib/server/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { RanobeDB } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import {
	type PublisherRelation,
	type PublisherRelationHist,
	type DB,
	type PublisherRelType,
} from '$lib/server/db/dbTypes';
import type { Insertable, Kysely, Transaction } from 'kysely';
import { arrayDiff } from '$lib/db/array';
import { reverseRelationUpdateMarkdown } from '$lib/db/revision';
import { publisherTypeReverseMap } from '$lib/db/dbConsts';

export class DBPublisherActions {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>) {
		const ranobeDB = new RanobeDB(db);
		return new this(ranobeDB);
	}

	// TODO For reverse relations, we might be able to just insert them
	// with a insert into from select sql

	// Why is this needed?
	// We need to add the publisher to the changes hist,
	// which should have everything, so we need the previous ones
	async getPublishersForReverseRelation(params: { trx: Transaction<DB>; publisher_ids: number[] }) {
		return await params.trx
			.selectFrom('publisher')
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('publisher_relation')
						.innerJoin(
							'publisher as publisher_child',
							'publisher_child.id',
							'publisher_relation.id_child',
						)
						.select([
							'publisher_relation.id_parent',
							'publisher_relation.id_child',
							'publisher_relation.relation_type',
						])
						.select(['publisher_child.name'])
						.whereRef('publisher_relation.id_parent', '=', 'publisher.id')
						.where('publisher_child.hidden', '=', false),
				).as('child_publishers'),
			)
			.select([
				'publisher.id',
				'publisher.description',
				'publisher.name',
				'publisher.romaji',
				'publisher.bookwalker_id',
			])
			.where('publisher.id', 'in', params.publisher_ids)
			.execute();
	}

	async updateReversePublisherRelations(params: {
		trx: Transaction<DB>;
		main_id: number;
		og_change: { revision: number };
		publishers: {
			id: number;
			name: string;
			relation_type: PublisherRelType;
			romaji?: string | null | undefined;
		}[];
	}) {
		const reverse_publishers = await this.getPublishersForReverseRelation({
			trx: params.trx,
			publisher_ids: params.publishers.map((i) => i.id),
		});

		for (const publisher of params.publishers) {
			const publisher_to_update = reverse_publishers.find((item) => item.id === publisher.id);
			if (!publisher_to_update) continue;

			const reverseRelChange = await addChange(
				params.trx,
				{
					comments: reverseRelationUpdateMarkdown(
						'p',
						'publisher',
						params.main_id,
						params.og_change.revision,
					),
					hidden: false,
					locked: false,
					item_id: publisher.id,
					item_name: 'publisher',
				},
				{ id: 'RanobeBot' },
			);
			const current = publisher_to_update.child_publishers;
			await params.trx
				.updateTable('publisher_relation')
				.set({
					relation_type: publisherTypeReverseMap[publisher.relation_type],
				})
				.where('publisher_relation.id_parent', '=', publisher.id)
				.where('publisher_relation.id_child', '=', params.main_id)
				.execute();

			const batch_add = current
				.filter((item) => item.id_child !== params.main_id)
				.map((item) => ({
					change_id: reverseRelChange.change_id,
					id_child: item.id_child,
					relation_type: item.relation_type,
				})) satisfies Insertable<PublisherRelationHist>[];
			batch_add.push({
				change_id: reverseRelChange.change_id,
				relation_type: publisherTypeReverseMap[publisher.relation_type],
				id_child: params.main_id,
			});
			await params.trx
				.insertInto('publisher_hist')
				.values({
					change_id: reverseRelChange.change_id,
					description: publisher_to_update.description,
					name: publisher_to_update.name,
					romaji: publisher_to_update.romaji,
					bookwalker_id: publisher_to_update.bookwalker_id,
				})
				.execute();
			if (batch_add.length > 0) {
				await params.trx.insertInto('publisher_relation_hist').values(batch_add).execute();
			}
		}
	}

	async removeReversePublisherRelations(params: {
		trx: Transaction<DB>;
		main_id: number;
		og_change: { revision: number };
		publisher_ids: number[];
	}) {
		const reverse_publishers = await this.getPublishersForReverseRelation({
			trx: params.trx,
			publisher_ids: params.publisher_ids,
		});

		for (const id of params.publisher_ids) {
			const publisher_to_remove = reverse_publishers.find((item) => item.id === id);
			if (!publisher_to_remove) continue;

			const reverseRelChange = await addChange(
				params.trx,
				{
					comments: reverseRelationUpdateMarkdown(
						'p',
						'publisher',
						params.main_id,
						params.og_change.revision,
					),
					hidden: false,
					locked: false,
					item_id: id,
					item_name: 'publisher',
				},
				{ id: 'RanobeBot' },
			);
			let current = publisher_to_remove.child_publishers;
			await params.trx
				.deleteFrom('publisher_relation')
				.where('id_child', '=', params.main_id)
				.where('id_parent', '=', id)
				.execute();
			await params.trx
				.insertInto('publisher_hist')
				.values({
					change_id: reverseRelChange.change_id,
					description: publisher_to_remove.description,
					name: publisher_to_remove.name,
					romaji: publisher_to_remove.romaji,
					bookwalker_id: publisher_to_remove.bookwalker_id,
				})
				.execute();
			current = current.filter((item) => item.id_child !== params.main_id);
			if (current.length > 0) {
				await params.trx
					.insertInto('publisher_relation_hist')
					.values(
						current.map((c) => ({
							change_id: reverseRelChange.change_id,
							id_child: c.id_child,
							relation_type: c.relation_type,
						})),
					)
					.execute();
			}
		}
	}

	async addReversePublisherRelations(params: {
		trx: Transaction<DB>;
		main_id: number;
		og_change: { revision: number };
		publishers: {
			id: number;
			name: string;
			relation_type: PublisherRelType;
			romaji?: string | null | undefined;
		}[];
	}) {
		const reverse_publishers = await this.getPublishersForReverseRelation({
			trx: params.trx,
			publisher_ids: params.publishers.map((i) => i.id),
		});

		for (const publisher of params.publishers) {
			const publisher_to_add = reverse_publishers.find((item) => item.id === publisher.id);
			if (!publisher_to_add) {
				continue;
			}

			const reverseRelChange = await addChange(
				params.trx,
				{
					comments: reverseRelationUpdateMarkdown(
						'p',
						'publisher',
						params.main_id,
						params.og_change.revision,
					),
					hidden: false,
					locked: false,
					item_id: publisher.id,
					item_name: 'publisher',
				},
				{ id: 'RanobeBot' },
			);
			const current = publisher_to_add.child_publishers;
			const newRelation = {
				id_child: params.main_id,
				id_parent: publisher.id,
				relation_type: publisherTypeReverseMap[publisher.relation_type],
			};
			await params.trx.insertInto('publisher_relation').values(newRelation).execute();

			const batch_add = current.map((item) => ({
				change_id: reverseRelChange.change_id,
				id_child: item.id_child,
				relation_type: item.relation_type,
			})) satisfies Insertable<PublisherRelationHist>[];
			batch_add.push({
				change_id: reverseRelChange.change_id,
				relation_type: publisherTypeReverseMap[publisher.relation_type],
				id_child: params.main_id,
			});
			await params.trx
				.insertInto('publisher_hist')
				.values({
					change_id: reverseRelChange.change_id,
					description: publisher_to_add.description,
					name: publisher_to_add.name,
					romaji: publisher_to_add.romaji,
					bookwalker_id: publisher_to_add.bookwalker_id,
				})
				.execute();
			if (batch_add.length > 0) {
				await params.trx.insertInto('publisher_relation_hist').values(batch_add).execute();
			}
		}
	}

	async editPublisher(data: { publisher: Infer<typeof publisherSchema>; id: number }, user: User) {
		await this.ranobeDB.db.transaction().execute(async (trx) => {
			const currentPublisher = await trx
				.selectFrom('publisher')
				.where('publisher.id', '=', data.id)
				.select(['publisher.hidden', 'publisher.locked'])
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom('publisher_relation')
							.innerJoin('publisher', 'publisher.id', 'publisher_relation.id_child')
							.select(['publisher_relation.id_child as id', 'publisher_relation.relation_type'])
							.select(['publisher.description', 'publisher.name', 'publisher.romaji'])
							.where('publisher_relation.id_parent', '=', data.id)
							.where('publisher.hidden', '=', false),
					).as('child_publishers'),
					jsonArrayFrom(
						eb
							.selectFrom('publisher_relation')
							.innerJoin('publisher', 'publisher.id', 'publisher_relation.id_parent')
							.select(['publisher_relation.id_parent as id', 'publisher_relation.relation_type'])
							.where('publisher_relation.id_child', '=', data.id)
							.where('publisher.hidden', '=', false),
					).as('parent_publishers'),
					jsonArrayFrom(
						eb
							.selectFrom('release_publisher')
							.innerJoin('release', 'release.id', 'release_publisher.release_id')
							.select('release.id as release_id')
							.where('release_publisher.publisher_id', '=', data.id),
					).as('release_publisher'),
				])
				.executeTakeFirstOrThrow();

			const userHasVisibilityPerms = hasVisibilityPerms(user);
			const hidden = userHasVisibilityPerms ? data.publisher.hidden : currentPublisher.hidden;
			const locked = userHasVisibilityPerms
				? data.publisher.hidden || data.publisher.locked
				: currentPublisher.locked;

			if (currentPublisher.hidden || currentPublisher.locked) {
				if (!userHasVisibilityPerms) {
					throw new ChangePermissionError('');
				}
			}

			if (!currentPublisher.hidden && data.publisher.hidden) {
				if (
					currentPublisher.child_publishers.length + currentPublisher.release_publisher.length >
					0
				) {
					throw new HasRelationsError('');
				}
			}

			const change = await addChange(
				trx,
				{
					comments: data.publisher.comment,
					hidden,
					locked,
					item_id: data.id,
					item_name: 'publisher',
				},
				user,
			);

			await trx
				.updateTable('publisher')
				.set({
					name: data.publisher.name,
					romaji: data.publisher.romaji,
					description: data.publisher.description ?? '',
					hidden,
					locked,
					bookwalker_id: data.publisher.bookwalker_id,
					twitter_id: data.publisher.twitter_id,
					website: data.publisher.website,
					wikidata_id: data.publisher.wikidata_id,
				})
				.where('publisher.id', '=', data.id)
				.executeTakeFirstOrThrow();

			await trx
				.insertInto('publisher_hist')
				.values({
					name: data.publisher.name,
					romaji: data.publisher.romaji,
					description: data.publisher.description ?? '',
					bookwalker_id: data.publisher.bookwalker_id,
					change_id: change.change_id,
				})
				.executeTakeFirstOrThrow();

			// publisher_relation_hist
			const publisher_relations_hist = data.publisher.child_publishers.map((item) => {
				return {
					change_id: change.change_id,
					id_child: item.id,
					relation_type: item.relation_type,
				};
			}) satisfies Insertable<PublisherRelationHist>[];
			if (publisher_relations_hist.length > 0) {
				await trx.insertInto('publisher_relation_hist').values(publisher_relations_hist).execute();
			}

			const currentDiff = arrayDiff(
				currentPublisher.child_publishers,
				data.publisher.child_publishers,
			);

			if (currentDiff.length > 0) {
				await trx
					.deleteFrom('publisher_relation')
					.where(
						'publisher_relation.id_child',
						'in',
						currentDiff.map((item) => item.id),
					)
					.where('publisher_relation.id_parent', '=', data.id)
					.execute();
			}
			// Remove reverse pub rels
			if (currentDiff.length > 0) {
				await this.removeReversePublisherRelations({
					trx,
					main_id: data.id,
					og_change: change,
					publisher_ids: currentDiff.map((i) => i.id),
				});
			}

			const toUpdate = data.publisher.child_publishers.filter((item1) =>
				currentPublisher.child_publishers.some(
					(item2) => item2.id === item1.id && item1.relation_type !== item2.relation_type,
				),
			);

			for (const item of toUpdate) {
				await trx
					.updateTable('publisher_relation')
					.set({
						relation_type: item.relation_type,
					})
					.where('publisher_relation.id_parent', '=', data.id)
					.where('publisher_relation.id_child', '=', item.id)
					.execute();
			}
			// update reverse pub rels
			if (toUpdate.length > 0) {
				await this.updateReversePublisherRelations({
					trx,
					main_id: data.id,
					og_change: change,
					publishers: toUpdate,
				});
			}

			const newDiff = arrayDiff(data.publisher.child_publishers, currentPublisher.child_publishers);
			const publisher_relations = newDiff.map((item) => {
				return { id_parent: data.id, id_child: item.id, relation_type: item.relation_type };
			}) satisfies Insertable<PublisherRelation>[];
			if (publisher_relations.length > 0) {
				await trx.insertInto('publisher_relation').values(publisher_relations).execute();
			}

			// add reverse relations
			if (newDiff.length > 0) {
				await this.addReversePublisherRelations({
					trx,
					main_id: data.id,
					og_change: change,
					publishers: newDiff,
				});
			}
		});
	}

	async addPublisher(data: { publisher: Infer<typeof publisherSchema> }, user: User) {
		return await this.ranobeDB.db.transaction().execute(async (trx) => {
			const canChangeVisibility = permissions[user.role].includes('visibility');
			const hidden = canChangeVisibility ? data.publisher.hidden : false;
			const locked = canChangeVisibility ? data.publisher.hidden || data.publisher.locked : false;

			const insertedPublisher = await trx
				.insertInto('publisher')
				.values({
					name: data.publisher.name,
					romaji: data.publisher.romaji,
					description: data.publisher.description ?? '',
					bookwalker_id: data.publisher.bookwalker_id,
					hidden,
					locked,
					twitter_id: data.publisher.twitter_id,
					website: data.publisher.website,
					wikidata_id: data.publisher.wikidata_id,
				})
				.returning('publisher.id')
				.executeTakeFirstOrThrow();

			const change = await addChange(
				trx,
				{
					comments: data.publisher.comment,
					hidden,
					locked,
					item_id: insertedPublisher.id,
					item_name: 'publisher',
				},
				user,
			);

			await trx
				.insertInto('publisher_hist')
				.values({
					name: data.publisher.name,
					romaji: data.publisher.romaji,
					description: data.publisher.description ?? '',
					bookwalker_id: data.publisher.bookwalker_id,
					change_id: change.change_id,
				})
				.executeTakeFirstOrThrow();
			const publisher_relations = data.publisher.child_publishers.map((item) => {
				return {
					id_parent: insertedPublisher.id,
					id_child: item.id,
					relation_type: item.relation_type,
				};
			}) satisfies Insertable<PublisherRelation>[];
			if (publisher_relations.length > 0) {
				await trx.insertInto('publisher_relation').values(publisher_relations).execute();
			}
			const publisher_relations_hist = data.publisher.child_publishers.map((item) => {
				return {
					change_id: change.change_id,
					id_child: item.id,
					relation_type: item.relation_type,
				};
			}) satisfies Insertable<PublisherRelationHist>[];
			if (publisher_relations.length > 0) {
				await trx.insertInto('publisher_relation_hist').values(publisher_relations_hist).execute();
			}

			// add reverse pub rels
			if (data.publisher.child_publishers.length > 0) {
				await this.addReversePublisherRelations({
					trx,
					main_id: insertedPublisher.id,
					og_change: change,
					publishers: data.publisher.child_publishers,
				});
			}

			return insertedPublisher.id;
		});
	}
}
