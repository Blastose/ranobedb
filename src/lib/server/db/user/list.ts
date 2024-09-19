import { db } from '$lib/server/db/db';
import type { Nullish } from '$lib/server/zod/schema';
import { defaultUserListLabelsArray } from '$lib/db/dbConsts';
import { Kysely, sql, type Transaction, type InferResult } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { DB } from '../dbTypes';
import { DBSeriesListActions } from './series-list';
import { DBUsers } from './user';

export function getUserBookLabels(userId: string, all: boolean) {
	return db
		.selectFrom('user_list_label')
		.where('user_list_label.user_id', '=', userId)
		.select(['user_list_label.id', 'user_list_label.label'])
		.$if(!all, (qb) => qb.where('user_list_label.id', '>', 10))
		.where('user_list_label.target', 'in', ['book', 'both'])
		.execute();
}

export function getUserBookLabelsForBook(userId: string, bookId: number) {
	return db
		.selectFrom('user_list_book_label')
		.innerJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_book_label.user_id')
				.onRef('user_list_label.id', '=', 'user_list_book_label.label_id'),
		)
		.select(['user_list_label.label', 'user_list_label.id'])
		.where('user_list_book_label.book_id', '=', bookId)
		.where('user_list_book_label.user_id', '=', userId)
		.where('user_list_label.id', '>', 10)
		.where('user_list_label.target', 'in', ['book', 'both'])
		.orderBy('id asc')
		.execute();
}

export function getUserLabelCounts(userId: string, min: number = 1, max: number = 10) {
	return db
		.selectFrom('user_list_book')
		.leftJoin('user_list_book_label', (join) =>
			join
				.onRef('user_list_book_label.user_id', '=', 'user_list_book.user_id')
				.onRef('user_list_book_label.book_id', '=', 'user_list_book.book_id')
				.on('user_list_book.user_id', '=', userId),
		)
		.fullJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_book.user_id')
				.onRef('user_list_label.id', '=', 'user_list_book_label.label_id'),
		)
		.leftJoin('book', 'book.id', 'user_list_book.book_id')
		.select((eb) => eb.fn.coalesce('user_list_label.label', sql<string>`'No label'`).as('label'))
		.select((eb) => eb.fn.count('user_list_book.book_id').as('count'))
		.select((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`9999`).as('label_id'))
		.where((eb) =>
			eb.or([eb('user_list_book.user_id', '=', userId), eb('user_list_book.user_id', 'is', null)]),
		)
		.where('user_list_label.user_id', '=', userId)
		.where('user_list_label.id', '>=', min)
		.where('user_list_label.id', '<=', max)
		.where((eb) => eb.or([eb('book.hidden', '=', false), eb('book.hidden', 'is', null)]))
		.where('user_list_label.target', 'in', ['book', 'both'])
		.groupBy(['user_list_label.label', 'user_list_label.id'])
		.orderBy((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`99999`));
}
export type UserLabel = InferResult<ReturnType<typeof getUserLabelCounts>>[number];

export async function getUserListCounts(params: { userId: string }) {
	return await db
		.selectNoFrom((eb) => [
			eb
				.selectFrom('user_list_book')
				.innerJoin('book', 'user_list_book.book_id', 'book.id')
				.where('book.hidden', '=', false)
				.where('user_list_book.user_id', '=', params.userId)
				.select((eb) => eb.fn.count('user_list_book.book_id').as('book_count'))
				.as('book'),
			eb
				.selectFrom('user_list_series')
				.innerJoin('series', 'user_list_series.series_id', 'series.id')
				.where('series.hidden', '=', false)
				.where('user_list_series.user_id', '=', params.userId)
				.select((eb) => eb.fn.count('user_list_series.series_id').as('series_count'))
				.as('series'),
			eb
				.selectFrom('user_list_release')
				.innerJoin('release', 'user_list_release.release_id', 'release.id')
				.where('release.hidden', '=', false)
				.where('user_list_release.user_id', '=', params.userId)
				.select((eb) => eb.fn.count('user_list_release.release_id').as('release_count'))
				.as('release'),
		])
		.executeTakeFirstOrThrow();
}
export type ListCounts = Awaited<ReturnType<typeof getUserListCounts>>;

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
							.onRef('user_list_label.id', '=', 'user_list_book_label.label_id'),
					)
					.select(['user_list_label.label', 'user_list_label.id'])
					.whereRef('user_list_book_label.book_id', '=', 'user_list_book.book_id')
					.whereRef('user_list_book_label.user_id', '=', 'user_list_book.user_id')
					.where('user_list_label.id', '<=', 10)
					.orderBy('id asc'),
			).as('labels'),
		])
		.where('user_list_book.user_id', '=', userId)
		.where('user_list_book.book_id', '=', bookId)
		.select([
			'user_list_book.started',
			'user_list_book.finished',
			'user_list_book.notes',
			'user_list_book.score',
		]);
}

export type UserListBookWithLabels = InferResult<
	ReturnType<typeof getUserListBookWithLabels>
>[number];

export function getToAddAndToRemoveFromArrays(arr1: number[], arr2: number[]) {
	const toAdd = arr1.filter((x) => !arr2.includes(x));
	const toRemove = arr2.filter((x) => !arr1.includes(x));
	return { toAdd, toRemove };
}

export class DBListActions {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async addBookToList(params: {
		userId: string;
		bookId: number;
		labelIds: number[];
		selectedCustLabels: number[];
		readingStatusId: number;
		score: Nullish<number>;
		started: Nullish<string>;
		finished: Nullish<string>;
		notes: Nullish<string>;
		trx?: Transaction<DB>;
	}) {
		const query = async (trx: Transaction<DB>) => {
			const seriesInList = await trx
				.selectFrom('series_book')
				.innerJoin('book', 'series_book.book_id', 'book.id')
				.innerJoin('series', 'series.id', 'series_book.series_id')
				.leftJoin('user_list_series', (join) =>
					join
						.onRef('user_list_series.series_id', '=', 'series_book.series_id')
						.on((eb) =>
							eb.or([
								eb('user_list_series.user_id', '=', params.userId),
								eb('user_list_series.user_id', 'is', null),
							]),
						),
				)
				.where('book.hidden', '=', false)
				.where('series.hidden', '=', false)
				.where('series_book.book_id', '=', params.bookId)
				.where((eb) =>
					eb.or([
						eb('user_list_series.user_id', '=', params.userId),
						eb('user_list_series.user_id', 'is', null),
					]),
				)
				.select(['series_book.series_id', 'user_list_series.user_id'])
				.limit(1)
				.executeTakeFirst();

			if (seriesInList && !seriesInList.user_id) {
				const dbSeriesListActions = new DBSeriesListActions(this.db);
				const dbUsers = new DBUsers(db);
				const default_series_settings = (await dbUsers.getListPrefs(params.userId, trx))
					.default_series_settings;
				await dbSeriesListActions.addSeriesToList({
					trx,
					series_id: seriesInList.series_id,
					user_id: params.userId,
					labelIds: [],
					readingStatusId:
						defaultUserListLabelsArray.indexOf(default_series_settings.readingStatus) + 1,
					formats: default_series_settings.formats,
					langs: default_series_settings.langs,
					show_upcoming: default_series_settings.show_upcoming,
					notify_book: default_series_settings.show_upcoming && default_series_settings.notify_book,
					volumes_read: null,
					selectedCustLabels: [],
					notes: '',
					finished: null,
					score: null,
					started: null,
				});
			}

			await trx
				.insertInto('user_list_book')
				.values({
					book_id: params.bookId,
					score: params.score,
					user_id: params.userId,
					started: params.started,
					finished: params.finished,
					notes: params.notes ?? '',
					last_updated: new Date(),
				})
				.execute();

			params.labelIds.push(params.readingStatusId);
			const userListBookLabels = params.labelIds.map((labelId) => {
				return {
					book_id: params.bookId,
					user_id: params.userId,
					label_id: labelId,
				};
			});
			userListBookLabels.push(
				...params.selectedCustLabels.map((v) => ({
					book_id: params.bookId,
					user_id: params.userId,
					label_id: v,
				})),
			);
			if (userListBookLabels.length > 0) {
				await trx.insertInto('user_list_book_label').values(userListBookLabels).execute();
			}
		};

		if (params.trx) {
			const trx = params.trx;
			await query(trx);
		} else {
			await this.db.transaction().execute(query);
		}
	}

	async editBookInList(params: {
		userId: string;
		bookId: number;
		labelIds: number[];
		selectedCustLabels: number[];
		readingStatusId: number;
		score: Nullish<number>;
		started: Nullish<string>;
		finished: Nullish<string>;
		notes: Nullish<string>;
	}) {
		await this.db.transaction().execute(async (trx) => {
			const oldLabelIds = (
				await trx
					.selectFrom('user_list_book_label')
					.select('label_id')
					.where('user_id', '=', params.userId)
					.where('book_id', '=', params.bookId)
					.execute()
			).map((v) => v.label_id);

			const { toAdd } = getToAddAndToRemoveFromArrays(params.labelIds, oldLabelIds);

			await trx
				.updateTable('user_list_book')
				.set({
					book_id: params.bookId,
					score: params.score,
					user_id: params.userId,
					started: params.started,
					finished: params.finished,
					notes: params.notes ?? '',
					last_updated: new Date(),
				})
				.where('book_id', '=', params.bookId)
				.where('user_id', '=', params.userId)
				.execute();

			await trx
				.deleteFrom('user_list_book_label')
				.where('book_id', '=', params.bookId)
				.where('user_id', '=', params.userId)
				.execute();

			toAdd.push(params.readingStatusId);
			const toAddLabels = toAdd.map((labelId) => {
				return {
					book_id: params.bookId,
					user_id: params.userId,
					label_id: labelId,
				};
			});
			toAddLabels.push(
				...params.selectedCustLabels.map((v) => ({
					book_id: params.bookId,
					user_id: params.userId,
					label_id: v,
				})),
			);
			if (toAddLabels.length > 0) {
				await trx.insertInto('user_list_book_label').values(toAddLabels).execute();
			}
		});
	}

	async removeBookFromList(params: { userId: string; bookId: number }) {
		await this.db.transaction().execute(async (trx) => {
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
			await trx
				.deleteFrom('user_list_release')
				.where('user_id', '=', params.userId)
				.where((eb) =>
					eb(
						'user_list_release.release_id',
						'in',
						eb
							.selectFrom('release')
							.innerJoin('release_book', 'release_book.release_id', 'user_list_release.release_id')
							.select('release.id')
							.where('release_book.book_id', '=', params.bookId),
					),
				)
				.execute();
		});
	}
}
