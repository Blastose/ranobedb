import type { bookSchema } from '$lib/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { db } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';

export async function editBook(data: { book: Infer<typeof bookSchema>; id: number }, user: User) {
	await db.transaction().execute(async (trx) => {
		const change = await addChange(
			trx,
			{
				comments: data.book.comment,
				hidden: data.book.hidden,
				locked: data.book.locked,
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
				hidden: data.book.hidden,
				locked: data.book.locked
			})
			.where('book.id', '=', data.id)
			.executeTakeFirstOrThrow();

		await trx
			.insertInto('book_hist')
			.values({
				description: data.book.description ?? '',
				description_ja: data.book.description_ja,
				change_id: change.change_id
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
		});
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
		});
		if (bookTitleHistInsert.length > 0) {
			await trx.insertInto('book_title_hist').values(bookTitleHistInsert).execute();
		}
	});
}
