import type { DB } from '$lib/db/dbTypes';
import { defaultUserListLabels } from '$lib/zod/schema';
import type { Transaction } from 'kysely';

export async function insertDefaultUserListLabels(trx: Transaction<DB>, userId: string) {
	const defaultUserListLabelValues = defaultUserListLabels.map((v) => {
		return {
			...v,
			private: false,
			user_id: userId,
		};
	});
	await trx
		.insertInto('user_list_label')
		.values(defaultUserListLabelValues)
		.onConflict((oc) => oc.columns(['user_id', 'id']).doNothing())
		.execute();
}
