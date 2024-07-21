import { Kysely, type Insertable, type Transaction } from 'kysely';
import type {
	DB,
	Language,
	ReleaseFormat,
	UserListSeriesFormat,
	UserListSeriesLang,
} from '../dbTypes';
import { getToAddAndToRemoveFromArrays } from './list';
import { defaultUserListLabels } from '$lib/db/dbConsts';
import type { Nullish } from '$lib/server/zod/schema';

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

	// TODO add more params from form
	async addSeriesToList(params: {
		series_id: number;
		user_id: string;
		labelIds: number[];
		readingStatusId: number;
		langs: Language[];
		formats: ReleaseFormat[];
		show_upcoming: boolean;
		volumes_read: Nullish<number>;
		trx?: Transaction<DB>;
	}) {
		const query = async (trx: Transaction<DB>) => {
			await trx
				.insertInto('user_list_series')
				.values({
					notify_book: false,
					show_upcoming: params.show_upcoming,
					series_id: params.series_id,
					user_id: params.user_id,
					volumes_read: params.volumes_read,
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
		readingStatusId: number;
		langs: Language[];
		show_upcoming: boolean;
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

			const { toAdd, toRemove } = getToAddAndToRemoveFromArrays(params.labelIds, oldLabelIds);

			await trx
				.updateTable('user_list_series')
				.set({ show_upcoming: params.show_upcoming, volumes_read: params.volumes_read })
				.where('user_list_series.series_id', '=', params.series_id)
				.where('user_list_series.user_id', '=', params.user_id)
				.execute();
			toRemove.push(...defaultUserListLabels.map((v) => v.id));
			if (toRemove.length > 0) {
				await trx
					.deleteFrom('user_list_series_label')
					.where((eb) =>
						eb.and([
							eb('series_id', '=', params.series_id),
							eb('user_id', '=', params.user_id),
							eb('label_id', 'in', toRemove),
						]),
					)
					.execute();
			}
			toAdd.push(params.readingStatusId);
			const toAddLabels = toAdd.map((labelId) => {
				return {
					series_id: params.series_id,
					user_id: params.user_id,
					label_id: labelId,
				};
			});
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
