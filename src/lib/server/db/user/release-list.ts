import { Kysely } from 'kysely';
import type { DB, UserListReleaseStatus } from '../dbTypes';
import { DBListActions } from './list';

export class DBReleaseListActions {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async addReleaseToList(params: {
		release_id: number;
		user_id: string;
		release_status: UserListReleaseStatus;
	}) {
		const { release_id, user_id, release_status } = params;
		const dbListActions = new DBListActions(this.db);
		await this.db.transaction().execute(async (trx) => {
			const bookIds = await trx
				.selectFrom('release')
				.innerJoin('release_book', 'release_book.release_id', 'release.id')
				.innerJoin('book', 'release_book.book_id', 'book.id')
				.leftJoin('user_list_book', (join) =>
					join
						.onRef('user_list_book.book_id', '=', 'book.id')
						.on('user_list_book.user_id', '=', user_id),
				)
				.where('release.hidden', '=', false)
				.where('release.id', '=', release_id)
				.where('book.hidden', '=', false)
				.where('user_list_book.user_id', 'is', null)
				.select('book.id')
				.execute();

			if (bookIds.length > 0) {
				for (const book of bookIds) {
					await dbListActions.addBookToList({
						bookId: book.id,
						finished: undefined,
						labelIds: [],
						notes: undefined,
						readingStatusId: 1,
						score: undefined,
						started: undefined,
						userId: user_id,
						trx: trx,
						selectedCustLabels: [],
					});
				}
			}

			await trx
				.insertInto('user_list_release')
				.values({
					release_id,
					release_status,
					user_id,
				})
				.execute();
		});
	}

	async editReleaseInList(params: {
		release_id: number;
		user_id: string;
		release_status: UserListReleaseStatus;
	}) {
		const { release_id, user_id, release_status } = params;
		await this.db.transaction().execute(async (trx) => {
			await trx
				.updateTable('user_list_release')
				.set({
					release_status,
				})
				.where('user_list_release.release_id', '=', release_id)
				.where('user_list_release.user_id', '=', user_id)
				.execute();
		});
	}

	async removeReleaseFromList(params: { release_id: number; user_id: string }) {
		const { release_id, user_id } = params;
		await this.db.transaction().execute(async (trx) => {
			await trx
				.deleteFrom('user_list_release')
				.where('user_list_release.user_id', '=', user_id)
				.where('user_list_release.release_id', '=', release_id)
				.execute();
		});
	}
}
