import type { publisherSchema } from '$lib/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { db } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { PublisherRelation, PublisherRelationHist } from '$lib/db/dbTypes';
import type { Insertable } from 'kysely';

export async function editPublisher(
	data: { publisher: Infer<typeof publisherSchema>; id: number },
	user: User
) {
	await db.transaction().execute(async (trx) => {
		const currentPublisher = await trx
			.selectFrom('publisher')
			.where('publisher.id', '=', data.id)
			.select(['publisher.hidden', 'publisher.locked'])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('publisher_relation')
						.innerJoin('publisher', 'publisher.id', 'publisher_relation.id_child')
						.select('publisher_relation.id_parent')
						.where('publisher_relation.id_parent', '=', data.id)
				).as('child_publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('release_publisher')
						.innerJoin('release', 'release.id', 'release_publisher.release_id')
						.select('publisher.id')
						.where('release_publisher.publisher_id', '=', data.id)
				).as('release_publisher')
			])
			.executeTakeFirstOrThrow();

		const userHasVisibilityPerms = hasVisibilityPerms(user);
		const hidden = userHasVisibilityPerms ? data.publisher.hidden : currentPublisher.hidden;
		const locked = userHasVisibilityPerms ? data.publisher.locked : currentPublisher.locked;

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
				item_name: 'publisher'
			},
			user
		);

		await trx
			.updateTable('publisher')
			.set({
				name: data.publisher.name,
				romaji: data.publisher.romaji,
				description: data.publisher.description ?? '',
				hidden,
				locked
			})
			.where('publisher.id', '=', data.id)
			.executeTakeFirstOrThrow();

		await trx
			.insertInto('publisher_hist')
			.values({
				name: data.publisher.name,
				romaji: data.publisher.romaji,
				description: data.publisher.description ?? '',
				change_id: change.change_id
			})
			.executeTakeFirstOrThrow();

		await trx
			.deleteFrom('publisher_relation')
			.where('publisher_relation.id_parent', '=', data.id)
			.execute();
		const publisher_relations = data.publisher.child_publishers.map((item) => {
			return { id_parent: data.id, id_child: item.id, relation_type: item.relation_type };
		}) satisfies Insertable<PublisherRelation>[];
		if (publisher_relations.length > 0) {
			await trx.insertInto('publisher_relation').values(publisher_relations).execute();
		}
		const publisher_relations_hist = data.publisher.child_publishers.map((item) => {
			return {
				change_id: change.change_id,
				id_child: item.id,
				relation_type: item.relation_type
			};
		}) satisfies Insertable<PublisherRelationHist>[];
		if (publisher_relations_hist.length > 0) {
			await trx.insertInto('publisher_relation_hist').values(publisher_relations_hist).execute();
		}
	});
}

export async function addPublisher(data: { publisher: Infer<typeof publisherSchema> }, user: User) {
	return await db.transaction().execute(async (trx) => {
		const canChangeVisibility = permissions[user.role].includes('visibility');
		const hidden = canChangeVisibility ? data.publisher.hidden : false;
		const locked = canChangeVisibility ? data.publisher.locked : false;

		const insertedPublisher = await trx
			.insertInto('publisher')
			.values({
				name: data.publisher.name,
				romaji: data.publisher.romaji,
				description: data.publisher.description ?? '',
				hidden,
				locked
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
				item_name: 'publisher'
			},
			user
		);

		await trx
			.insertInto('publisher_hist')
			.values({
				name: data.publisher.name,
				romaji: data.publisher.romaji,
				description: data.publisher.description ?? '',
				change_id: change.change_id
			})
			.executeTakeFirstOrThrow();
		const publisher_relations = data.publisher.child_publishers.map((item) => {
			return {
				id_parent: insertedPublisher.id,
				id_child: item.id,
				relation_type: item.relation_type
			};
		}) satisfies Insertable<PublisherRelation>[];
		if (publisher_relations.length > 0) {
			await trx.insertInto('publisher_relation').values(publisher_relations).execute();
		}
		return insertedPublisher.id;
	});
}
