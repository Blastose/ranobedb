import { db } from '$lib/server/db/db';
import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export function getUserLabelCounts(userId: string) {
	return db
		.selectFrom('user_list_book')
		.leftJoin('user_list_book_label', (join) =>
			join
				.onRef('user_list_book_label.user_id', '=', 'user_list_book.user_id')
				.onRef('user_list_book_label.book_id', '=', 'user_list_book.book_id')
				.on('user_list_book.user_id', '=', userId)
		)
		.fullJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_book.user_id')
				.onRef('user_list_label.id', '=', 'user_list_book_label.label_id')
		)
		.select((eb) => eb.fn.coalesce('user_list_label.label', sql<string>`'No label'`).as('label'))
		.select((eb) => eb.fn.count('user_list_book.book_id').as('book_count'))
		.select((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`9999`).as('label_id'))
		.where((eb) =>
			eb.or([eb('user_list_book.user_id', '=', userId), eb('user_list_book.user_id', 'is', null)])
		)
		.where('user_list_label.user_id', '=', userId)
		.groupBy(['user_list_label.label', 'user_list_label.id'])
		.orderBy((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`99999`));
}

export function getUserListBookWithLabels(userId: string, bookId: number) {
	return db
		.selectFrom('user_list_book')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('user_list_book_label')
					.innerJoin('user_list_label', (join) =>
						join
							.onRef('user_list_label.user_id', '=', 'user_list_book_label.user_id')
							.onRef('user_list_label.id', '=', 'user_list_book_label.label_id')
					)
					.select(['user_list_label.label', 'user_list_label.id'])
					.whereRef('user_list_book_label.book_id', '=', 'user_list_book.book_id')
					.whereRef('user_list_book_label.user_id', '=', 'user_list_book.user_id')
			).as('labels')
		])
		.where('user_list_book.user_id', '=', userId)
		.where('user_list_book.book_id', '=', bookId)
		.select([
			'user_list_book.started',
			'user_list_book.finished',
			'user_list_book.notes',
			'user_list_book.score'
		]);
}

export async function addBookToList(params: {
	userId: string;
	bookId: number;
	labelIds: number[];
	score: number | null;
	started: string | null;
	finished: string | null;
	notes: string | null;
}) {
	await db.transaction().execute(async (trx) => {
		await trx
			.insertInto('user_list_book')
			.values({
				book_id: params.bookId,
				score: params.score,
				user_id: params.userId,
				started: params.started,
				finished: params.finished,
				notes: params.notes ?? ''
			})
			.execute();

		const userListBookLabels = params.labelIds.map((labelId) => {
			return {
				book_id: params.bookId,
				user_id: params.userId,
				label_id: labelId
			};
		});
		if (userListBookLabels.length > 0) {
			await trx.insertInto('user_list_book_label').values(userListBookLabels).execute();
		}
	});
}

function getToAddAndToRemoveFromArrays(arr1: number[], arr2: number[]) {
	const toAdd = arr1.filter((x) => !arr2.includes(x));
	const toRemove = arr2.filter((x) => !arr1.includes(x));
	return { toAdd, toRemove };
}

export async function editBookInList(params: {
	userId: string;
	bookId: number;
	labelIds: number[];
	score: number | null;
	started: string | null;
	finished: string | null;
	notes: string | null;
}) {
	await db.transaction().execute(async (trx) => {
		const oldLabelIds = (
			await trx
				.selectFrom('user_list_book_label')
				.select('label_id')
				.where('user_id', '=', params.userId)
				.execute()
		).map((v) => v.label_id);

		const { toAdd, toRemove } = getToAddAndToRemoveFromArrays(params.labelIds, oldLabelIds);

		await trx
			.updateTable('user_list_book')
			.set({
				book_id: params.bookId,
				score: params.score,
				user_id: params.userId,
				started: params.started,
				finished: params.finished,
				notes: params.notes ?? ''
			})
			.execute();

		if (toRemove.length > 0) {
			await trx
				.deleteFrom('user_list_book_label')
				.where((eb) =>
					eb.and([
						eb('book_id', '=', params.bookId),
						eb('user_id', '=', params.userId),
						eb('label_id', 'in', toRemove)
					])
				)
				.execute();
		}

		const toAddLabels = toAdd.map((labelId) => {
			return {
				book_id: params.bookId,
				user_id: params.userId,
				label_id: labelId
			};
		});
		if (toAddLabels.length > 0) {
			await trx.insertInto('user_list_book_label').values(toAddLabels).execute();
		}
	});
}

export async function removeBookFromList(params: { userId: string; bookId: number }) {
	await db.transaction().execute(async (trx) => {
		await trx.deleteFrom('user_list_book_label').where('book_id', '=', params.bookId).execute();
		await trx
			.deleteFrom('user_list_book')
			.where((eb) => eb.and([eb('book_id', '=', params.bookId), eb('user_id', '=', params.userId)]))
			.execute();
	});
}
