import type { DB, DbItem } from '$lib/db/dbTypes';
import type { Transaction } from 'kysely';
import type { User } from 'lucia';

export async function addChange(
	trx: Transaction<DB>,
	changeItem: {
		item_name: DbItem;
		item_id: number;
		comments: string;
		locked: boolean;
		hidden: boolean;
	},
	user: User
) {
	const revision = await trx
		.selectFrom('change')
		.where('change.item_name', '=', changeItem.item_name)
		.where('change.item_id', '=', changeItem.item_id)
		.select('change.revision')
		.orderBy('change.revision desc')
		.limit(1)
		.executeTakeFirst();

	const revisionNumber = revision?.revision ? revision.revision + 1 : 1;

	const change = await trx
		.insertInto('change')
		.values({
			ihid: changeItem.hidden,
			ilock: changeItem.locked,
			item_name: changeItem.item_name,
			item_id: changeItem.item_id,
			revision: revisionNumber,
			user_id: user.id,
			comments: changeItem.comments
		})
		.returning('change.id')
		.executeTakeFirstOrThrow();
	return { change_id: change.id, revision: revisionNumber };
}
