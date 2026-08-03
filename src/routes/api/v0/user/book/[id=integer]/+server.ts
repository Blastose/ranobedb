import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { userListBookSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { db } from '$lib/server/db/db';
import { defaultUserListLabelsMap } from '$lib/db/dbConsts';
import { DBListActions } from '$lib/server/db/user/list';

const apiUserListBookSchema = userListBookSchema.omit({
	type: true,
	// from my understanding this is omittable
	labels: true,
});

async function validateRequest(event: RequestEvent) {
	const { params, locals } = event;

	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	if (!params.id) {
		error(400, 'No ID specified');
	}

	return {
		user: locals.user,
		bookId: parseInt(params.id),
	};
}

async function addOrEditUserBook(event: RequestEvent) {
	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const validatedBody = apiUserListBookSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json(z.treeifyError(validatedBody.error), { status: 400 });
	}

	const data = validatedBody.data;
	const { user, bookId } = await validateRequest(event);

	const [existingUserBook, userCustLabels] = await Promise.all([
		db
			.selectFrom('user_list_book')
			.select('book_id')
			.where('user_id', '=', user.id)
			.where('book_id', '=', bookId)
			.executeTakeFirst(),
		db
			.selectFrom('user_list_label')
			.select('id')
			.where('user_id', '=', user.id)
			.where('id', '>', 10)
			.execute(),
	]);

	const userCustLabelIds = new Set(userCustLabels.map((l) => l.id));

	const invalidLabelIds = data.selectedCustLabels.filter((id) => !userCustLabelIds.has(id));

	if (invalidLabelIds.length > 0) {
		error(400, `Invalid or non-existent custom label ID(s): ${invalidLabelIds.join(', ')}`);
	}

	const readingStatusId = defaultUserListLabelsMap.get(data.readingStatus) ?? 1;
	const dbListActions = new DBListActions(db);
	if (!existingUserBook) {
		await dbListActions.addBookToList({
			trx: undefined,
			bookId,
			userId: user.id,
			labelIds: [],
			readingStatusId,
			selectedCustLabels: data.selectedCustLabels,
			notes: data.notes ?? '',
			started: data.started || null,
			finished: data.finished || null,
			score: data.score ? data.score * 10 : data.score,
		});
	} else {
		await dbListActions.editBookInList({
			bookId,
			userId: user.id,
			labelIds: [],
			readingStatusId,
			selectedCustLabels: data.selectedCustLabels,
			notes: data.notes ?? '',
			started: data.started || null,
			finished: data.finished || null,
			score: data.score ? data.score * 10 : data.score,
		});
	}
	return json({ success: true, action: existingUserBook ? 'edit' : 'add' });
}

async function deleteUserBook(event: RequestEvent) {
	const { user, bookId } = await validateRequest(event);
	const existingUserBook = await db
		.selectFrom('user_list_book')
		.select('book_id')
		.where('user_id', '=', user.id)
		.where('book_id', '=', bookId)
		.executeTakeFirst();

	if (!existingUserBook) {
		error(400, 'Book is not in the list');
	}

	const dbListActions = new DBListActions(db);
	await dbListActions.removeBookFromList({
		bookId: bookId,
		userId: user.id,
	});

	return json({ success: true });
}

export const PUT: RequestHandler = addOrEditUserBook;
export const DELETE: RequestHandler = deleteUserBook;
