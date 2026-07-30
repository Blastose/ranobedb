import { error, json, type RequestHandler } from '@sveltejs/kit';
import { userListBookSchema } from '$lib/server/zod/schema';
import * as z from 'zod';
import { db } from '$lib/server/db/db';
import { defaultUserListLabelsArray, defaultUserListLabelsMap } from '$lib/db/dbConsts';
import { DBListActions } from '$lib/server/db/user/list';

const maxNumberValue = 2147483647;

const apiUserListBookSchema = userListBookSchema
	.extend({
		bookId: z.number(),
		readingStatus: z.enum(defaultUserListLabelsArray).default('Reading'),
		selectedCustLabels: z.array(z.number().min(11).max(maxNumberValue)).max(2000).default([]),
	})
	.omit({
		type: true,

		// from my understanding this is omittable
		labels: true,
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

	const validatedBody = apiUserListBookSchema.safeParse(body);
	if (!validatedBody.success) {
		// cant use error() here because treeifyError doesnt satisfy Error
		return json({ error: z.treeifyError(validatedBody.error) }, { status: 400 });
	}

	const data = validatedBody.data;

	const [existingUserBook, userCustLabels] = await Promise.all([
		db
			.selectFrom('user_list_book')
			.select('book_id')
			.where('user_id', '=', user.id)
			.where('book_id', '=', data.bookId)
			.executeTakeFirst(),
		db
			.selectFrom('user_list_label')
			.select('id')
			.where('user_id', '=', user.id)
			.where('id', '>', 10)
			.execute(),
	]);

	if (existingUserBook) {
		return error(400, 'Book is already in list');
	}

	const userCustLabelIds = new Set(userCustLabels.map((l) => l.id));

	const invalidLabelIds = data.selectedCustLabels.filter((id) => !userCustLabelIds.has(id));

	if (invalidLabelIds.length > 0) {
		return error(400, `Invalid or non-existent custom label ID(s): ${invalidLabelIds.join(', ')}`);
	}

	const readingStatusId = defaultUserListLabelsMap.get(data.readingStatus) ?? 1;
	const dbListActions = new DBListActions(db);

	await dbListActions.addBookToList({
		trx: undefined,
		bookId: data.bookId,
		userId: user.id,
		labelIds: [],
		readingStatusId,
		selectedCustLabels: data.selectedCustLabels,
		notes: data.notes ?? '',
		started: data.started || null,
		finished: data.finished || null,
		score: data.score ? data.score * 10 : data.score,
	});

	return json({ success: true });
};
