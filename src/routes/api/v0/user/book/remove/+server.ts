import { error, json, type RequestHandler } from '@sveltejs/kit';
import * as z from 'zod';
import { DBListActions } from '$lib/server/db/user/list';
import { db } from '$lib/server/db/db';

const apiUserRemoveBookSchema = z.object({
	bookId: z.number(),
});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const user = locals.user;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}

	const validatedBody = apiUserRemoveBookSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json({ error: z.treeifyError(validatedBody.error) }, { status: 400 });
	}

	const data = validatedBody.data;

	const existingUserBook = await db
		.selectFrom('user_list_book')
		.select('book_id')
		.where('user_id', '=', user.id)
		.where('book_id', '=', data.bookId)
		.executeTakeFirst();

	if (!existingUserBook) {
		return error(400, 'Book is not in the list');
	}

	const dbListActions = new DBListActions(db);
	await dbListActions.removeBookFromList({
		bookId: data.bookId,
		userId: user.id,
	});

	return json({ success: true });
};
