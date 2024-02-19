import { db } from '$lib/server/db/db.js';

export const load = async ({ params }) => {
	const id = params.id;
	const bookId = Number(id);

	const changes = await db
		.selectFrom('change')
		.where('change.item_name', '=', 'book')
		.where('change.item_id', '=', bookId)
		.selectAll()
		.execute();

	return { changes };
};
