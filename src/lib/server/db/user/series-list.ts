import { Kysely, sql, type Insertable, type Transaction } from 'kysely';
import type {
	DB,
	Language,
	ReleaseFormat,
	UserListSeriesFormat,
	UserListSeriesLang,
} from '../dbTypes';
import { getToAddAndToRemoveFromArrays } from './list';
import type { Nullish } from '$lib/server/zod/schema';
import { db } from '$lib/server/db/db';

export function getUserSeriesLabels(userId: string, all: boolean) {
	return db
		.selectFrom('user_list_label')
		.where('user_list_label.user_id', '=', userId)
		.select(['user_list_label.id', 'user_list_label.label'])
		.$if(!all, (qb) => qb.where('user_list_label.id', '>', 10))
		.where('user_list_label.target', 'in', ['series', 'both'])
		.execute();
}

export function getUserSeriesLabelsForSeries(userId: string, seriesId: number) {
	return db
		.selectFrom('user_list_series_label')
		.innerJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_series_label.user_id')
				.onRef('user_list_label.id', '=', 'user_list_series_label.label_id'),
		)
		.select(['user_list_label.label', 'user_list_label.id'])
		.where('user_list_series_label.series_id', '=', seriesId)
		.where('user_list_series_label.user_id', '=', userId)
		.where('user_list_label.id', '>', 10)
		.where('user_list_label.target', 'in', ['series', 'both'])
		.orderBy('id asc')
		.execute();
}

export function getUserSeriesListCounts(
	db: Kysely<DB>,
	userId: string,
	min: number = 1,
	max: number = 10,
) {
	return db
		.selectFrom('user_list_series')
		.leftJoin('user_list_series_label', (join) =>
			join
				.onRef('user_list_series_label.user_id', '=', 'user_list_series.user_id')
				.onRef('user_list_series_label.series_id', '=', 'user_list_series.series_id')
				.on('user_list_series.user_id', '=', userId),
		)
		.fullJoin('user_list_label', (join) =>
			join
				.onRef('user_list_label.user_id', '=', 'user_list_series.user_id')
				.onRef('user_list_label.id', '=', 'user_list_series_label.label_id'),
		)
		.leftJoin('series', 'series.id', 'user_list_series.series_id')
		.select((eb) => eb.fn.coalesce('user_list_label.label', sql<string>`'No label'`).as('label'))
		.select((eb) => eb.fn.count('user_list_series.series_id').as('count'))
		.select((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`9999`).as('label_id'))
		.where((eb) =>
			eb.or([
				eb('user_list_series.user_id', '=', userId),
				eb('user_list_series.user_id', 'is', null),
			]),
		)
		.where('user_list_label.user_id', '=', userId)
		.where('user_list_label.id', '>=', min)
		.where('user_list_label.id', '<=', max)
		.where((eb) => eb.or([eb('series.hidden', '=', false), eb('series.hidden', 'is', null)]))
		.where('user_list_label.target', 'in', ['series', 'both'])
		.groupBy(['user_list_label.label', 'user_list_label.id'])
		.orderBy((eb) => eb.fn.coalesce('user_list_label.id', sql<number>`99999`));
}

export class DBSeriesListActions {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async addUserListSeriesLangsAndFormats(params: {
		series_id: number;
		user_id: string;
		langs: Language[];
		formats: ReleaseFormat[];
		trx: Transaction<DB>;
	}) {
		const { trx } = params;
		await trx
			.deleteFrom('user_list_series_lang')
			.where('user_list_series_lang.series_id', '=', params.series_id)
			.where('user_list_series_lang.user_id', '=', params.user_id)
			.execute();
		await trx
			.deleteFrom('user_list_series_format')
			.where('user_list_series_format.series_id', '=', params.series_id)
			.where('user_list_series_format.user_id', '=', params.user_id)
			.execute();
		const userListSeriesLangs = params.langs.map((v) => ({
			lang: v,
			series_id: params.series_id,
			user_id: params.user_id,
		})) satisfies Insertable<UserListSeriesLang>[];
		if (userListSeriesLangs.length > 0) {
			await trx.insertInto('user_list_series_lang').values(userListSeriesLangs).execute();
		}
		const userListSeriesFormats = params.formats.map((v) => ({
			format: v,
			series_id: params.series_id,
			user_id: params.user_id,
		})) satisfies Insertable<UserListSeriesFormat>[];
		if (userListSeriesFormats.length > 0) {
			await trx.insertInto('user_list_series_format').values(userListSeriesFormats).execute();
		}
	}

	async addSeriesToList(params: {
		series_id: number;
		user_id: string;
		labelIds: number[];
		score: Nullish<number>;
		started: Nullish<string>;
		finished: Nullish<string>;
		notes: Nullish<string>;
		readingStatusId: number;
		langs: Language[];
		formats: ReleaseFormat[];
		show_upcoming: boolean;
		notify_book: boolean;
		selectedCustLabels: number[];
		volumes_read: Nullish<number>;
		trx?: Transaction<DB>;
	}) {
		const query = async (trx: Transaction<DB>) => {
			await trx
				.insertInto('user_list_series')
				.values({
					show_upcoming: params.show_upcoming,
					notify_book: params.show_upcoming && params.notify_book,
					series_id: params.series_id,
					user_id: params.user_id,
					volumes_read: params.volumes_read,
					last_updated: new Date(),
					notes: params.notes ?? '',
					started: params.started,
					finished: params.finished,
					score: params.score,
				})
				.execute();

			await this.addUserListSeriesLangsAndFormats({ ...params, trx });

			params.labelIds.push(params.readingStatusId);
			const userListSeriesLabels = params.labelIds.map((labelId) => {
				return {
					series_id: params.series_id,
					user_id: params.user_id,
					label_id: labelId,
				};
			});
			userListSeriesLabels.push(
				...params.selectedCustLabels.map((v) => ({
					series_id: params.series_id,
					user_id: params.user_id,
					label_id: v,
				})),
			);
			if (userListSeriesLabels.length > 0) {
				await trx.insertInto('user_list_series_label').values(userListSeriesLabels).execute();
			}
		};

		if (params.trx) {
			const trx = params.trx;
			await query(trx);
		} else {
			await this.db.transaction().execute(async (trx) => query(trx));
		}
	}

	async editSeriesInList(params: {
		series_id: number;
		user_id: string;
		labelIds: number[];
		score: Nullish<number>;
		started: Nullish<string>;
		finished: Nullish<string>;
		notes: Nullish<string>;
		readingStatusId: number;
		selectedCustLabels: number[];
		langs: Language[];
		show_upcoming: boolean;
		notify_book: boolean;
		volumes_read: Nullish<number>;
		formats: ReleaseFormat[];
	}) {
		await this.db.transaction().execute(async (trx) => {
			const oldLabelIds = (
				await trx
					.selectFrom('user_list_series_label')
					.select('label_id')
					.where('user_id', '=', params.user_id)
					.where('series_id', '=', params.series_id)
					.execute()
			).map((v) => v.label_id);

			const { toAdd } = getToAddAndToRemoveFromArrays(params.labelIds, oldLabelIds);

			await trx
				.updateTable('user_list_series')
				.set({
					show_upcoming: params.show_upcoming,
					notify_book: params.show_upcoming && params.notify_book,
					volumes_read: params.volumes_read,
					last_updated: new Date(),
					notes: params.notes ?? '',
					started: params.started,
					finished: params.finished,
					score: params.score,
				})
				.where('user_list_series.series_id', '=', params.series_id)
				.where('user_list_series.user_id', '=', params.user_id)
				.execute();
			await trx
				.deleteFrom('user_list_series_label')
				.where((eb) =>
					eb.and([eb('series_id', '=', params.series_id), eb('user_id', '=', params.user_id)]),
				)
				.execute();
			toAdd.push(params.readingStatusId);
			const toAddLabels = toAdd.map((labelId) => {
				return {
					series_id: params.series_id,
					user_id: params.user_id,
					label_id: labelId,
				};
			});
			toAddLabels.push(
				...params.selectedCustLabels.map((v) => ({
					series_id: params.series_id,
					user_id: params.user_id,
					label_id: v,
				})),
			);
			if (toAddLabels.length > 0) {
				await trx.insertInto('user_list_series_label').values(toAddLabels).execute();
			}

			await this.addUserListSeriesLangsAndFormats({ ...params, trx });
		});
	}

	async removeSeriesFromList(params: { series_id: number; user_id: string; remove_all: boolean }) {
		await this.db.transaction().execute(async (trx) => {
			await trx
				.deleteFrom('user_list_series_lang')
				.where('user_list_series_lang.series_id', '=', params.series_id)
				.where('user_list_series_lang.user_id', '=', params.user_id)
				.execute();
			await trx
				.deleteFrom('user_list_series_format')
				.where('user_list_series_format.series_id', '=', params.series_id)
				.where('user_list_series_format.user_id', '=', params.user_id)
				.execute();
			await trx
				.deleteFrom('user_list_series_label')
				.where('user_list_series_label.series_id', '=', params.series_id)
				.where('user_list_series_label.user_id', '=', params.user_id)
				.execute();
			await trx
				.deleteFrom('user_list_series')
				.where('user_list_series.series_id', '=', params.series_id)
				.where('user_list_series.user_id', '=', params.user_id)
				.execute();

			if (params.remove_all) {
				await trx
					.deleteFrom('user_list_book_label')
					.where((eb) =>
						eb(
							'user_list_book_label.book_id',
							'in',
							eb
								.selectFrom('series_book')
								.select('series_book.book_id')
								.where('series_book.series_id', '=', params.series_id),
						),
					)
					.where('user_id', '=', params.user_id)
					.execute();
				await trx
					.deleteFrom('user_list_book')
					.where((eb) =>
						eb(
							'user_list_book.book_id',
							'in',
							eb
								.selectFrom('series_book')
								.select('series_book.book_id')
								.where('series_book.series_id', '=', params.series_id),
						),
					)
					.where('user_id', '=', params.user_id)
					.execute();
				await trx
					.deleteFrom('user_list_release')
					.where('user_id', '=', params.user_id)
					.where((eb) =>
						eb(
							'user_list_release.release_id',
							'in',
							eb
								.selectFrom('release')
								.innerJoin(
									'release_book',
									'release_book.release_id',
									'user_list_release.release_id',
								)
								.select('release.id')
								.where((eb) =>
									eb(
										'release_book.book_id',
										'in',
										eb
											.selectFrom('series_book')
											.select('series_book.book_id')
											.where('series_book.series_id', '=', params.series_id),
									),
								),
						),
					)
					.execute();
			}
		});
	}
}
