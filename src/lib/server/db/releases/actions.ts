import type { releaseSchema } from '$lib/server/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { RanobeDB } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { arrayDiff, arrayIntersection } from '$lib/db/array';
import type { Insertable, Kysely } from 'kysely';
import type {
	DB,
	ReleaseBook,
	ReleaseBookHist,
	ReleasePublisher,
	ReleasePublisherHist,
} from '$lib/server/db/dbTypes';

export class DBReleaseActions {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>) {
		const ranobeDB = new RanobeDB(db);
		return new this(ranobeDB);
	}

	async editRelease(data: { release: Infer<typeof releaseSchema>; id: number }, user: User) {
		await this.ranobeDB.db.transaction().execute(async (trx) => {
			const currentRelease = await trx
				.selectFrom('release')
				.selectAll('release')
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom('publisher')
							.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
							.whereRef('release_publisher.release_id', '=', 'release.id')
							.select(['publisher.name', 'publisher_type', 'publisher.id']),
					).as('publishers'),
					jsonArrayFrom(
						eb
							.selectFrom('book')
							.innerJoin('release_book', (join) =>
								join
									.onRef('release_book.book_id', '=', 'book.id')
									.onRef('release_book.release_id', '=', 'release.id'),
							)
							.select(['book.id', 'release_book.rtype']),
					).as('books'),
				])
				.where('release.id', '=', data.id)
				.executeTakeFirstOrThrow();

			const userHasVisibilityPerms = hasVisibilityPerms(user);
			const hidden = userHasVisibilityPerms ? data.release.hidden : currentRelease.hidden;
			const locked = userHasVisibilityPerms
				? data.release.hidden || data.release.locked
				: currentRelease.locked;

			if (currentRelease.hidden || currentRelease.locked) {
				if (!userHasVisibilityPerms) {
					throw new ChangePermissionError('');
				}
			}

			const change = await addChange(
				trx,
				{
					comments: data.release.comment,
					hidden,
					locked,
					item_id: data.id,
					item_name: 'release',
				},
				user,
			);

			await trx
				.updateTable('release')
				.set({
					hidden,
					locked,
					description: data.release.description ?? '',
					format: data.release.format,
					isbn13: data.release.isbn13,
					lang: data.release.lang,
					pages: data.release.pages,
					release_date: data.release.release_date,
					romaji: data.release.romaji,
					title: data.release.title,
					amazon: data.release.amazon,
					bookwalker: data.release.bookwalker,
					rakuten: data.release.rakuten,
					website: data.release.website,
				})
				.where('release.id', '=', data.id)
				.executeTakeFirstOrThrow();
			await trx
				.insertInto('release_hist')
				.values({
					change_id: change.change_id,
					description: data.release.description ?? '',
					format: data.release.format,
					isbn13: data.release.isbn13,
					lang: data.release.lang,
					pages: data.release.pages,
					release_date: data.release.release_date,
					romaji: data.release.romaji,
					title: data.release.title,
					amazon: data.release.amazon,
					bookwalker: data.release.bookwalker,
					rakuten: data.release.rakuten,
					website: data.release.website,
				})
				.executeTakeFirstOrThrow();

			// release_book_hist
			// add all
			const release_book_hist = data.release.books.map((item) => {
				return {
					change_id: change.change_id,
					rtype: item.rtype,
					book_id: item.id,
				};
			}) satisfies Insertable<ReleaseBookHist>[];
			if (release_book_hist.length > 0) {
				await trx.insertInto('release_book_hist').values(release_book_hist).execute();
			}

			// release_book
			const booksCurrentDiff = arrayDiff(currentRelease.books, data.release.books);
			if (booksCurrentDiff.length > 0) {
				await trx
					.deleteFrom('release_book')
					.where(
						'book_id',
						'in',
						booksCurrentDiff.map((item) => item.id),
					)
					.where('release_book.release_id', '=', data.id)
					.execute();
			}
			const booksToUpdate = arrayIntersection(data.release.books, currentRelease.books);
			for (const item of booksToUpdate) {
				await trx
					.updateTable('release_book')
					.set({
						rtype: item.rtype,
					})
					.where('release_book.release_id', '=', data.id)
					.where('release_book.book_id', '=', item.id)
					.execute();
			}
			const booksNewDiff = arrayDiff(data.release.books, currentRelease.books);
			const release_book_add = booksNewDiff.map((item) => {
				return { book_id: item.id, release_id: data.id, rtype: item.rtype };
			}) satisfies Insertable<ReleaseBook>[];
			if (release_book_add.length > 0) {
				await trx.insertInto('release_book').values(release_book_add).execute();
			}

			// release_publisher_hist
			// add all
			const release_publisher_hist = data.release.publishers.map((item) => {
				return {
					change_id: change.change_id,
					publisher_id: item.id,
					publisher_type: item.publisher_type,
				};
			}) satisfies Insertable<ReleasePublisherHist>[];
			if (release_publisher_hist.length > 0) {
				await trx.insertInto('release_publisher_hist').values(release_publisher_hist).execute();
			}

			// release_publisher
			// TODO We used to use the arrayDiff and arrayIntersection functions to only add/update/delete the changed entries
			// but it doesn't really work here since the pk is (release_id, publisher_id, and publisher_type)
			// so its simplier to just delete everything and add it again.
			await trx
				.deleteFrom('release_publisher')
				.where('release_publisher.release_id', '=', data.id)
				.execute();
			const release_publisher_add = data.release.publishers.map((item) => {
				return { publisher_id: item.id, publisher_type: item.publisher_type, release_id: data.id };
			}) satisfies Insertable<ReleasePublisher>[];
			if (release_publisher_add.length > 0) {
				await trx.insertInto('release_publisher').values(release_publisher_add).execute();
			}
		});
	}

	async addRelease(data: { release: Infer<typeof releaseSchema> }, user: User) {
		return await this.ranobeDB.db.transaction().execute(async (trx) => {
			const canChangeVisibility = permissions[user.role].includes('visibility');
			const hidden = canChangeVisibility ? data.release.hidden : false;
			const locked = canChangeVisibility ? data.release.hidden || data.release.locked : false;

			const insertedRelease = await trx
				.insertInto('release')
				.values({
					hidden,
					locked,
					description: data.release.description ?? '',
					format: data.release.format,
					isbn13: data.release.isbn13,
					lang: data.release.lang,
					pages: data.release.pages,
					release_date: data.release.release_date,
					romaji: data.release.romaji,
					title: data.release.title,
					amazon: data.release.amazon,
					bookwalker: data.release.bookwalker,
					rakuten: data.release.rakuten,
					website: data.release.website,
				})
				.returning('release.id')
				.executeTakeFirstOrThrow();

			const change = await addChange(
				trx,
				{
					comments: data.release.comment,
					hidden,
					locked,
					item_id: insertedRelease.id,
					item_name: 'release',
				},
				user,
			);
			await trx
				.insertInto('release_hist')
				.values({
					change_id: change.change_id,
					description: data.release.description ?? '',
					format: data.release.format,
					isbn13: data.release.isbn13,
					lang: data.release.lang,
					pages: data.release.pages,
					release_date: data.release.release_date,
					romaji: data.release.romaji,
					title: data.release.title,
					amazon: data.release.amazon,
					bookwalker: data.release.bookwalker,
					rakuten: data.release.rakuten,
					website: data.release.website,
				})
				.executeTakeFirstOrThrow();

			// release_book
			const release_book_add = data.release.books.map((item) => {
				return { book_id: item.id, release_id: insertedRelease.id, rtype: item.rtype };
			}) satisfies Insertable<ReleaseBook>[];
			if (release_book_add.length > 0) {
				await trx.insertInto('release_book').values(release_book_add).execute();
			}
			const release_book_add_hist = data.release.books.map((item) => {
				return { book_id: item.id, change_id: change.change_id, rtype: item.rtype };
			}) satisfies Insertable<ReleaseBookHist>[];
			if (release_book_add.length > 0) {
				await trx.insertInto('release_book_hist').values(release_book_add_hist).execute();
			}
			// release_publisher
			const release_publisher_add = data.release.publishers.map((item) => {
				return {
					publisher_id: item.id,
					publisher_type: item.publisher_type,
					release_id: insertedRelease.id,
				};
			}) satisfies Insertable<ReleasePublisher>[];
			if (release_publisher_add.length > 0) {
				await trx.insertInto('release_publisher').values(release_publisher_add).execute();
			}
			const release_publisher_add_hist = data.release.publishers.map((item) => {
				return {
					publisher_id: item.id,
					publisher_type: item.publisher_type,
					change_id: change.change_id,
				};
			}) satisfies Insertable<ReleasePublisherHist>[];
			if (release_publisher_add.length > 0) {
				await trx.insertInto('release_publisher_hist').values(release_publisher_add_hist).execute();
			}

			return insertedRelease.id;
		});
	}
}
