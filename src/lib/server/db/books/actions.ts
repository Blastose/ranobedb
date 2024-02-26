import type { bookSchema } from '$lib/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { db } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import type { Insertable } from 'kysely';
import type { BookStaffAlias, BookStaffAliasHist, BookTitle, BookTitleHist } from '$lib/db/dbTypes';
import { hasVisibilityPerms, permissions } from '../user/user';
import { ChangePermissionError } from '../errors/errors';

export async function editBook(data: { book: Infer<typeof bookSchema>; id: number }, user: User) {
	await db.transaction().execute(async (trx) => {
		const currentBook = await trx
			.selectFrom('book')
			.where('book.id', '=', data.id)
			.select(['book.hidden', 'book.locked'])
			.executeTakeFirstOrThrow();
		const userHasVisibilityPerms = hasVisibilityPerms(user);
		const hidden = userHasVisibilityPerms ? data.book.hidden : currentBook.hidden;
		const locked = userHasVisibilityPerms ? data.book.locked : currentBook.locked;

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
				item_name: 'book'
			},
			user
		);

		await trx
			.updateTable('book')
			.set({
				description: data.book.description ?? '',
				description_ja: data.book.description_ja,
				hidden,
				locked,
				image_id: data.book.image_id
			})
			.where('book.id', '=', data.id)
			.executeTakeFirstOrThrow();

		await trx
			.insertInto('book_hist')
			.values({
				description: data.book.description ?? '',
				description_ja: data.book.description_ja,
				change_id: change.change_id,
				image_id: data.book.image_id
			})
			.executeTakeFirstOrThrow();

		await trx.deleteFrom('book_title').where('book_title.book_id', '=', data.id).execute();
		const bookTitleInsert = data.book.titles.map((item) => {
			return {
				book_id: data.id,
				lang: item.lang,
				official: item.official,
				title: item.title,
				romaji: item.romaji
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
				romaji: item.romaji
			};
		}) satisfies Insertable<BookTitleHist>[];
		if (bookTitleHistInsert.length > 0) {
			await trx.insertInto('book_title_hist').values(bookTitleHistInsert).execute();
		}

		await trx
			.deleteFrom('book_staff_alias')
			.where('book_staff_alias.book_id', '=', data.id)
			.execute();
		const bookStaffAliases = data.book.staff.map((item) => {
			return {
				book_id: data.id,
				staff_alias_id: item.staff_alias_id,
				role_type: item.role_type,
				note: item.note
			};
		}) satisfies Insertable<BookStaffAlias>[];
		if (bookStaffAliases.length > 0) {
			await trx.insertInto('book_staff_alias').values(bookStaffAliases).execute();
		}
		const bookStaffAliasesHist = data.book.staff.map((item) => {
			return {
				change_id: change.change_id,
				staff_alias_id: item.staff_alias_id,
				role_type: item.role_type,
				note: item.note
			};
		}) satisfies Insertable<BookStaffAliasHist>[];
		if (bookStaffAliasesHist.length > 0) {
			await trx.insertInto('book_staff_alias_hist').values(bookStaffAliasesHist).execute();
		}
	});
}

export async function addBook(data: { book: Infer<typeof bookSchema> }, user: User) {
	return await db.transaction().execute(async (trx) => {
		const canChangeVisibility = permissions[user.role].includes('visibility');
		const hidden = canChangeVisibility ? data.book.hidden : false;
		const locked = canChangeVisibility ? data.book.locked : false;

		const insertedBook = await trx
			.insertInto('book')
			.values({
				description: data.book.description ?? '',
				description_ja: data.book.description_ja,
				hidden,
				locked,
				image_id: data.book.image_id
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
				item_name: 'book'
			},
			user
		);

		await trx
			.insertInto('book_hist')
			.values({
				description: data.book.description ?? '',
				description_ja: data.book.description_ja,
				change_id: change.change_id,
				image_id: data.book.image_id
			})
			.executeTakeFirstOrThrow();
		const bookTitleInsert = data.book.titles.map((item) => {
			return {
				book_id: insertedBook.id,
				lang: item.lang,
				official: item.official,
				title: item.title,
				romaji: item.romaji
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
				romaji: item.romaji
			};
		}) satisfies Insertable<BookTitleHist>[];
		if (bookTitleHistInsert.length > 0) {
			await trx.insertInto('book_title_hist').values(bookTitleHistInsert).execute();
		}

		const bookStaffAliases = data.book.staff.map((item) => {
			return {
				book_id: insertedBook.id,
				staff_alias_id: item.staff_alias_id,
				role_type: item.role_type,
				note: item.note
			};
		}) satisfies Insertable<BookStaffAlias>[];
		if (bookStaffAliases.length > 0) {
			await trx.insertInto('book_staff_alias').values(bookStaffAliases).execute();
		}
		const bookStaffAliasesHist = data.book.staff.map((item) => {
			return {
				change_id: change.change_id,
				staff_alias_id: item.staff_alias_id,
				role_type: item.role_type,
				note: item.note
			};
		}) satisfies Insertable<BookStaffAliasHist>[];
		if (bookStaffAliasesHist.length > 0) {
			await trx.insertInto('book_staff_alias_hist').values(bookStaffAliasesHist).execute();
		}

		return insertedBook.id;
	});
}
