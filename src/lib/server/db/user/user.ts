import { db } from '$lib/server/db/db';

export const defaultUserListLabels = [
	{ id: 1, label: 'Reading' },
	{ id: 2, label: 'Finished' },
	{ id: 3, label: 'Plan to read' },
	{ id: 4, label: 'Stalled' },
	{ id: 5, label: 'Dropped' }
];

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
