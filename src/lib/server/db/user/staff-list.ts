import type { Kysely } from 'kysely';
import type {
	Language,
	DB,
	ReleaseFormat,
	UserListStaffLang,
	UserListStaffFormat,
} from '$lib/server/db/dbTypes';
import type { Insertable, Transaction } from 'kysely';

export class DbStaffActions {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async addUserListStaffLangsAndFormats(params: {
		staff_id: number;
		user_id: string;
		langs: Language[];
		formats: ReleaseFormat[];
		trx: Transaction<DB>;
	}) {
		const { trx, staff_id, user_id, langs, formats } = params;
		await trx
			.deleteFrom('user_list_staff_lang')
			.where('user_list_staff_lang.staff_id', '=', staff_id)
			.where('user_list_staff_lang.user_id', '=', user_id)
			.execute();
		await trx
			.deleteFrom('user_list_staff_format')
			.where('user_list_staff_format.staff_id', '=', staff_id)
			.where('user_list_staff_format.user_id', '=', user_id)
			.execute();
		const userListstaffLangs = langs.map((v) => ({
			lang: v,
			staff_id: staff_id,
			user_id: user_id,
		})) satisfies Insertable<UserListStaffLang>[];
		if (userListstaffLangs.length > 0) {
			await trx.insertInto('user_list_staff_lang').values(userListstaffLangs).execute();
		}
		const userListstaffFormats = formats.map((v) => ({
			format: v,
			staff_id: staff_id,
			user_id: user_id,
		})) satisfies Insertable<UserListStaffFormat>[];
		if (userListstaffFormats.length > 0) {
			await trx.insertInto('user_list_staff_format').values(userListstaffFormats).execute();
		}
	}

	async addStaffToList(params: {
		notify_book: boolean;
		show_upcoming: boolean;
		only_first_book: boolean;
		staff_id: number;
		user_id: string;
		formats: ReleaseFormat[];
		langs: Language[];
	}) {
		const { notify_book, show_upcoming, only_first_book, staff_id, user_id, formats, langs } =
			params;
		await this.db.transaction().execute(async (trx) => {
			await trx
				.insertInto('user_list_staff')
				.values({
					notify_book: notify_book,
					show_upcoming: show_upcoming,
					only_first_book: only_first_book,
					staff_id: staff_id,
					user_id: user_id,
				})
				.execute();
			await this.addUserListStaffLangsAndFormats({
				formats: formats,
				langs: langs,
				staff_id: staff_id,
				user_id: user_id,
				trx: trx,
			});
		});
	}
	async editStaffInList(params: {
		notify_book: boolean;
		show_upcoming: boolean;
		only_first_book: boolean;
		staff_id: number;
		user_id: string;
		formats: ReleaseFormat[];
		langs: Language[];
	}) {
		const { notify_book, show_upcoming, only_first_book, staff_id, user_id, formats, langs } =
			params;
		await this.db.transaction().execute(async (trx) => {
			await trx
				.insertInto('user_list_staff')
				.values({
					notify_book: notify_book,
					show_upcoming: show_upcoming,
					only_first_book: only_first_book,
					staff_id: staff_id,
					user_id: user_id,
				})
				.onConflict((oc) =>
					oc.columns(['staff_id', 'user_id']).doUpdateSet({
						notify_book: notify_book,
						show_upcoming: show_upcoming,
						only_first_book: only_first_book,
					}),
				)
				.execute();
			await this.addUserListStaffLangsAndFormats({
				formats: formats,
				langs: langs,
				staff_id: staff_id,
				user_id: user_id,
				trx: trx,
			});
		});
	}
	async removeStaffInList(params: { staff_id: number; user_id: string }) {
		const { staff_id, user_id } = params;
		await this.db.transaction().execute(async (trx) => {
			await trx
				.deleteFrom('user_list_staff_format')
				.where('user_list_staff_format.staff_id', '=', staff_id)
				.where('user_list_staff_format.user_id', '=', user_id)
				.execute();
			await trx
				.deleteFrom('user_list_staff_lang')
				.where('user_list_staff_lang.staff_id', '=', staff_id)
				.where('user_list_staff_lang.user_id', '=', user_id)
				.execute();
			await trx
				.deleteFrom('user_list_staff')
				.where('user_list_staff.staff_id', '=', staff_id)
				.where('user_list_staff.user_id', '=', user_id)
				.execute();
		});
	}
}
