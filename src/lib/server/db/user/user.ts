import { db } from '$lib/server/db/db';

export async function insertDefaultUserListLabels(userId: string) {
	await db
		.insertInto('user_list_label')
		.values([
			{ id: 1, label: 'Reading', private: false, user_id: userId },
			{ id: 2, label: 'Finished', private: false, user_id: userId },
			{ id: 3, label: 'Plan to read', private: false, user_id: userId },
			{ id: 4, label: 'Stalled', private: false, user_id: userId },
			{ id: 5, label: 'Dropped', private: false, user_id: userId }
		])
		.onConflict((oc) => oc.columns(['user_id', 'id']).doNothing())
		.execute();
}
