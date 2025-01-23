import type { bookSchema } from '$lib/server/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { RanobeDB } from '../db';
import type { User } from '$lib/server/lucia/lucia';
import { addChange } from '../change/change';
import type { Insertable, Kysely } from 'kysely';
import type {
	BookEdition,
	BookEditionHist,
	BookStaffAlias,
	BookStaffAliasHist,
	BookTitle,
	BookTitleHist,
	DB,
} from '$lib/server/db/dbTypes';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { generateNanoid, resizeImage, saveImageToR2 } from '../images/upload';
import sizeOf from 'image-size';

export class DBBookActions {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>) {
		const ranobeDB = new RanobeDB(db);
		return new this(ranobeDB);
	}

	async editBook(data: { book: Infer<typeof bookSchema>; id: number }, user: User) {
		const uploadImage = await this.ranobeDB.db.transaction().execute(async (trx) => {
			const currentBook = await trx
				.selectFrom('book')
				.where('book.id', '=', data.id)
				.select(['book.hidden', 'book.locked'])
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom('staff_alias')
							.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
							.whereRef('book_staff_alias.book_id', '=', 'book.id')
							.select('staff_alias.id')
							.limit(1),
					).as('staff'),
				])
				.executeTakeFirstOrThrow();

			const userHasVisibilityPerms = hasVisibilityPerms(user);
			const hidden = userHasVisibilityPerms ? data.book.hidden : currentBook.hidden;
			const locked = userHasVisibilityPerms
				? data.book.hidden || data.book.locked
				: currentBook.locked;

			if (currentBook.hidden || currentBook.locked) {
				if (!userHasVisibilityPerms) {
					throw new ChangePermissionError('');
				}
			}

			const change = await addChange(
				trx,
				{
					comments: data.book.comment,
					hidden,
					locked,
					item_id: data.id,
					item_name: 'book',
				},
				user,
			);

			// If data.book.image_id_manual then get id (int) and use that
			// else if data.book.image (user uploaded image) then add image and use that
			// else use the old image_id
			let uploadImage: {
				buff: Buffer<ArrayBufferLike>;
				filename: string;
			} | null = null;
			let image_id = data.book.image_id;
			let resized_img_buff: Buffer<ArrayBufferLike> | null = null;
			if (data.book.image) {
				const img_buff = new Uint8Array(await data.book.image.arrayBuffer());
				resized_img_buff = await resizeImage(img_buff);

				const { height, width } = sizeOf(resized_img_buff);
				if (!height || !width || height > 2000) {
					throw new Error('Bad image uploaded');
				}
				const insertedImg = await trx
					.insertInto('image')
					.values({
						filename: generateNanoid() + '.jpg',
						height: height,
						nsfw: false,
						spoiler: true,
						width: width,
					})
					.returning(['image.id', 'image.filename'])
					.executeTakeFirstOrThrow();
				image_id = insertedImg.id;

				uploadImage = {
					buff: resized_img_buff,
					filename: insertedImg.filename,
				};
			} else if (data.book.image_id_manual) {
				const existing_image = await trx
					.selectFrom('image')
					.where('image.filename', '=', `${data.book.image_id_manual}.jpg`)
					.select('image.id')
					.executeTakeFirst();
				if (!existing_image) {
					throw new Error('Invalid image id');
				}
				image_id = existing_image.id;
			}

			await trx
				.updateTable('book')
				.set({
					description: data.book.description ?? '',
					description_ja: data.book.description_ja ?? '',
					hidden,
					locked,
					image_id: image_id,
					olang: data.book.olang,
				})
				.where('book.id', '=', data.id)
				.executeTakeFirstOrThrow();

			await trx
				.insertInto('book_hist')
				.values({
					description: data.book.description ?? '',
					description_ja: data.book.description_ja ?? '',
					change_id: change.change_id,
					image_id: image_id,
					release_date: 99999999,
					c_release_date: 99999999,
					olang: data.book.olang,
				})
				.executeTakeFirstOrThrow();

			await trx.deleteFrom('book_title').where('book_title.book_id', '=', data.id).execute();
			const bookTitleInsert = data.book.titles.map((item) => {
				return {
					book_id: data.id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<BookTitle>[];
			if (bookTitleInsert.length > 0) {
				await trx.insertInto('book_title').values(bookTitleInsert).execute();
			}
			const bookTitleHistInsert = data.book.titles.map((item) => {
				return {
					change_id: change.change_id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<BookTitleHist>[];
			if (bookTitleHistInsert.length > 0) {
				await trx.insertInto('book_title_hist').values(bookTitleHistInsert).execute();
			}

			await trx
				.deleteFrom('book_staff_alias')
				.where('book_staff_alias.book_id', '=', data.id)
				.execute();
			await trx.deleteFrom('book_edition').where('book_edition.book_id', '=', data.id).execute();
			const bookEditionInsert = data.book.editions
				.filter((item, index) => index === 0 || item.staff.length > 0)
				.map((item, index) => ({
					book_id: data.id,
					eid: index,
					lang: item.lang,
					title: item.title,
				})) satisfies Insertable<BookEdition>[];
			if (bookEditionInsert.length > 0) {
				await trx.insertInto('book_edition').values(bookEditionInsert).execute();
			}
			const bookEditionHistInsert = data.book.editions
				.filter((item, index) => index === 0 || item.staff.length > 0)
				.map((item, index) => ({
					change_id: change.change_id,
					eid: index,
					lang: item.lang,
					title: item.title,
				})) satisfies Insertable<BookEditionHist>[];
			if (bookEditionHistInsert.length > 0) {
				await trx.insertInto('book_edition_hist').values(bookEditionHistInsert).execute();
			}

			const bookStaffAliases: Insertable<BookStaffAlias>[] = [];
			const bookStaffAliasesHist: Insertable<BookStaffAliasHist>[] = [];
			for (const [index, edition] of data.book.editions.entries()) {
				for (const staff of edition.staff) {
					bookStaffAliases.push({
						book_id: data.id,
						staff_alias_id: staff.staff_alias_id,
						role_type: staff.role_type,
						note: staff.note,
						eid: index,
					});
					bookStaffAliasesHist.push({
						change_id: change.change_id,
						staff_alias_id: staff.staff_alias_id,
						role_type: staff.role_type,
						note: staff.note,
						eid: index,
					});
				}
			}
			if (bookStaffAliases.length > 0) {
				await trx.insertInto('book_staff_alias').values(bookStaffAliases).execute();
			}
			if (bookStaffAliasesHist.length > 0) {
				await trx.insertInto('book_staff_alias_hist').values(bookStaffAliasesHist).execute();
			}

			return uploadImage;
		});

		if (uploadImage) {
			await saveImageToR2(uploadImage.filename, uploadImage.buff);
		}
	}

	async addBook(data: { book: Infer<typeof bookSchema> }, user: User) {
		const res = await this.ranobeDB.db.transaction().execute(async (trx) => {
			const canChangeVisibility = permissions[user.role].includes('visibility');
			const hidden = canChangeVisibility ? data.book.hidden : false;
			const locked = canChangeVisibility ? data.book.hidden || data.book.locked : false;

			// TODO Copied from above; can refactor
			// If data.book.image_id_manual then get id (int) and use that
			// else if data.book.image (user uploaded image) then add image and use that
			// else use the old image_id
			let uploadImage: {
				buff: Buffer<ArrayBufferLike>;
				filename: string;
			} | null = null;
			let image_id = data.book.image_id;
			let resized_img_buff: Buffer<ArrayBufferLike> | null = null;
			if (data.book.image) {
				const img_buff = new Uint8Array(await data.book.image.arrayBuffer());
				resized_img_buff = await resizeImage(img_buff);

				const { height, width } = sizeOf(resized_img_buff);
				if (!height || !width || height > 2000) {
					throw new Error('Bad image uploaded');
				}
				const insertedImg = await trx
					.insertInto('image')
					.values({
						filename: generateNanoid() + '.jpg',
						height: height,
						nsfw: false,
						spoiler: true,
						width: width,
					})
					.returning(['image.id', 'image.filename'])
					.executeTakeFirstOrThrow();
				image_id = insertedImg.id;

				uploadImage = {
					buff: resized_img_buff,
					filename: insertedImg.filename,
				};
			} else if (data.book.image_id_manual) {
				const existing_image = await trx
					.selectFrom('image')
					.where('image.filename', '=', `${data.book.image_id_manual}.jpg`)
					.select('image.id')
					.executeTakeFirst();
				if (!existing_image) {
					throw new Error('Invalid image id');
				}
				image_id = existing_image.id;
			}

			const insertedBook = await trx
				.insertInto('book')
				.values({
					hidden,
					locked,
					description: data.book.description ?? '',
					description_ja: data.book.description_ja ?? '',
					image_id: image_id,
					release_date: 99999999,
					c_release_date: data.book.c_release_date ?? 99999999,
					olang: data.book.olang,
				})
				.returning('book.id')
				.executeTakeFirstOrThrow();

			const change = await addChange(
				trx,
				{
					comments: data.book.comment,
					hidden,
					locked,
					item_id: insertedBook.id,
					item_name: 'book',
				},
				user,
			);

			await trx
				.insertInto('book_hist')
				.values({
					change_id: change.change_id,
					description: data.book.description ?? '',
					description_ja: data.book.description_ja ?? '',
					image_id: image_id,
					release_date: 99999999,
					c_release_date: 99999999,
					olang: data.book.olang,
				})
				.executeTakeFirstOrThrow();
			const bookTitleInsert = data.book.titles.map((item) => {
				return {
					book_id: insertedBook.id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<BookTitle>[];
			if (bookTitleInsert.length > 0) {
				await trx.insertInto('book_title').values(bookTitleInsert).execute();
			}
			const bookTitleHistInsert = data.book.titles.map((item) => {
				return {
					change_id: change.change_id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<BookTitleHist>[];
			if (bookTitleHistInsert.length > 0) {
				await trx.insertInto('book_title_hist').values(bookTitleHistInsert).execute();
			}

			const bookEditionInsert = data.book.editions
				.filter((item, index) => index === 0 || item.staff.length > 0)
				.map((item, index) => ({
					book_id: insertedBook.id,
					eid: index,
					lang: item.lang,
					title: item.title,
				})) satisfies Insertable<BookEdition>[];
			if (bookEditionInsert.length > 0) {
				await trx.insertInto('book_edition').values(bookEditionInsert).execute();
			}
			const bookEditionHistInsert = data.book.editions
				.filter((item, index) => index === 0 || item.staff.length > 0)
				.map((item, index) => ({
					change_id: change.change_id,
					eid: index,
					lang: item.lang,
					title: item.title,
				})) satisfies Insertable<BookEditionHist>[];
			if (bookEditionHistInsert.length > 0) {
				await trx.insertInto('book_edition_hist').values(bookEditionHistInsert).execute();
			}

			const bookStaffAliases: Insertable<BookStaffAlias>[] = [];
			const bookStaffAliasesHist: Insertable<BookStaffAliasHist>[] = [];
			for (const [index, edition] of data.book.editions.entries()) {
				for (const staff of edition.staff) {
					bookStaffAliases.push({
						book_id: insertedBook.id,
						staff_alias_id: staff.staff_alias_id,
						role_type: staff.role_type,
						note: staff.note,
						eid: index,
					});
					bookStaffAliasesHist.push({
						change_id: change.change_id,
						staff_alias_id: staff.staff_alias_id,
						role_type: staff.role_type,
						note: staff.note,
						eid: index,
					});
				}
			}
			if (bookStaffAliases.length > 0) {
				await trx.insertInto('book_staff_alias').values(bookStaffAliases).execute();
			}
			if (bookStaffAliasesHist.length > 0) {
				await trx.insertInto('book_staff_alias_hist').values(bookStaffAliasesHist).execute();
			}

			return { id: insertedBook.id, uploadImage };
		});

		if (res.uploadImage) {
			await saveImageToR2(res.uploadImage.filename, res.uploadImage.buff);
		}

		return res.id;
	}
}
