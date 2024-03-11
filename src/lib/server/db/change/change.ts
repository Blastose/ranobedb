import type { DB, DbItem } from '$lib/db/dbTypes';
import type { InferResult, Transaction } from 'kysely';
import { db } from '../db';

export type Change = InferResult<ReturnType<typeof getChanges>>[number];
export function getChanges(item_name: DbItem, item_id: number, revisions?: number[]) {
	return db
		.selectFrom('change')
		.innerJoin('auth_user', 'change.user_id', 'auth_user.id')
		.where('change.item_name', '=', item_name)
		.where('change.item_id', '=', item_id)
		.$if(Boolean(revisions), (qb) =>
			qb.where((eb) => eb.or(revisions!.map((item) => eb('change.revision', '=', item))))
		)
		.selectAll('change')
		.select('auth_user.username')
		.orderBy('change.revision desc');
}

export async function addChange(
	trx: Transaction<DB>,
	changeItem: {
		item_name: DbItem;
		item_id: number;
		comments: string;
		locked: boolean;
		hidden: boolean;
	},
	user: { id: string }
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
