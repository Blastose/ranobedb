import type { publisherSchema, releaseSchema } from '$lib/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { db } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '../errors/errors';

export async function editRelease(
	data: { release: Infer<typeof releaseSchema>; id: number },
	user: User
) {
	await db.transaction().execute(async (trx) => {
		const currentRelease = await trx
			.selectFrom('release')
			.selectAll('release')
			.executeTakeFirstOrThrow();

		const userHasVisibilityPerms = hasVisibilityPerms(user);
		const hidden = userHasVisibilityPerms ? data.release.hidden : currentRelease.hidden;
		const locked = userHasVisibilityPerms ? data.release.locked : currentRelease.locked;

		if (currentRelease.hidden || currentRelease.locked) {
			if (!userHasVisibilityPerms) {
				throw new ChangePermissionError('');
			}
		}

		if (!currentRelease.hidden && data.release.hidden) {
			if (
				// currentRelease.child_publishers.length + currentRelease.release_publisher.length >
				0
			) {
				throw new HasRelationsError('');
			}
		}

		const change = await addChange(
			trx,
			{
				comments: data.release.comment,
				hidden,
				locked,
				item_id: data.id,
				item_name: 'publisher'
			},
			user
		);
	});
}

export async function addPublisher(data: { publisher: Infer<typeof publisherSchema> }, user: User) {
	return await db.transaction().execute(async (trx) => {
		const canChangeVisibility = permissions[user.role].includes('visibility');
		const hidden = canChangeVisibility ? data.publisher.hidden : false;
		const locked = canChangeVisibility ? data.publisher.locked : false;

		// const insertedRelease = await trx
		// 	.insertInto('release')
		// 	.values({})
		// 	.returning('publisher.id')
		// 	.executeTakeFirstOrThrow();

		// const change = await addChange(
		// 	trx,
		// 	{
		// 		comments: data.publisher.comment,
		// 		hidden,
		// 		locked,
		// 		item_id: insertedRelease.id,
		// 		item_name: 'publisher'
		// 	},
		// 	user
		// );

		// return insertedRelease.id;
	});
}
