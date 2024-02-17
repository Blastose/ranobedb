import { db } from '$lib/server/db/db';
import { defaultUserListLabels, type Nullish } from '$lib/zod/schema';
import { sql, type InferResult } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { withBookTitleCte } from '../books/books';

// TODO Refactor with getBooks2
export function getBooksRL(userId: string) {
	return db
		.with('cte_book', withBookTitleCte())
		.selectFrom('cte_book')
		.leftJoin('image', 'cte_book.image_id', 'image.id')
		.leftJoin('release_book', 'release_book.book_id', 'cte_book.id')
		.leftJoin('release', 'release.id', 'release_book.release_id')
		.innerJoin('user_list_book', (join) =>
			join
				.onRef('user_list_book.book_id', '=', 'cte_book.id')
				.on('user_list_book.user_id', '=', userId)
		)
		.innerJoin('user_list_book_label', (join) =>
			join
				.onRef('user_list_book_label.book_id', '=', 'cte_book.id')
				.onRef('user_list_book_label.user_id', '=', 'user_list_book.user_id')
		)
		.innerJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_book.user_id')
				.on((eb) => eb.between('user_list_label.id', 1, 10))
				.onRef('user_list_label.id', '=', 'user_list_book_label.label_id')
		)
		.select([
			'cte_book.description',
			'cte_book.description_ja',
			'cte_book.id',
			'cte_book.image_id',
			'cte_book.lang',
			'cte_book.romaji',
			'cte_book.romaji_orig',
			'cte_book.title',
			'cte_book.title_orig',
			'image.filename',
			'user_list_label.id as label_id',
			'user_list_label.label'
		])
		.select((eb) => eb.fn.min('release.release_date').as('date'))
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('book_title')
					.whereRef('book_title.book_id', '=', 'cte_book.id')
					.selectAll('book_title')
			).as('titles'),
			jsonArrayFrom(
				eb
					.selectFrom('staff_alias')
					.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
					.whereRef('book_staff_alias.book_id', '=', 'cte_book.id')
					.select(['book_staff_alias.role_type', 'staff_alias.name', 'staff_alias.staff_id'])
			).as('staff')
		])
		.groupBy([
			'cte_book.description',
			'cte_book.description_ja',
			'cte_book.id',
			'cte_book.image_id',
			'cte_book.lang',
			'cte_book.romaji',
			'cte_book.romaji_orig',
			'cte_book.title',
			'cte_book.title_orig',
			'image.filename',
			'user_list_label.id',
			'user_list_label.label'
		])
		.orderBy((eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'));
}

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
export type UserLabel = InferResult<ReturnType<typeof getUserLabelCounts>>[number];

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

export type UserListBookWithLabels = InferResult<
	ReturnType<typeof getUserListBookWithLabels>
>[number];

export async function addBookToList(params: {
	userId: string;
	bookId: number;
	labelIds: number[];
	readingStatusId: number;
	score: Nullish<number>;
	started: Nullish<string>;
	finished: Nullish<string>;
	notes: Nullish<string>;
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

		params.labelIds.push(params.readingStatusId);
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
	readingStatusId: number;
	score: Nullish<number>;
	started: Nullish<string>;
	finished: Nullish<string>;
	notes: Nullish<string>;
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
			.where('book_id', '=', params.bookId)
			.where('user_id', '=', params.userId)
			.execute();

		// Remove all default reaind status list ids
		toRemove.push(...defaultUserListLabels.map((v) => v.id));
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

		toAdd.push(params.readingStatusId);
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
		await trx
			.deleteFrom('user_list_book_label')
			.where('book_id', '=', params.bookId)
			.where('user_id', '=', params.userId)
			.execute();
		await trx
			.deleteFrom('user_list_book')
			.where('book_id', '=', params.bookId)
			.where('user_id', '=', params.userId)
			.execute();
	});
}
