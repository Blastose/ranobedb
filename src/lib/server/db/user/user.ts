import { db } from '$lib/server/db/db';
import { defaultUserListLabels } from '$lib/zod/schema';

export async function insertDefaultUserListLabels(userId: string) {
	const defaultUserListLabelValues = defaultUserListLabels.map((v) => {
		return {
			...v,
			private: false,
			user_id: userId
		};
	});
	await db
		.insertInto('user_list_label')
		.values(defaultUserListLabelValues)
		.onConflict((oc) => oc.columns(['user_id', 'id']).doNothing())
		.execute();
}
