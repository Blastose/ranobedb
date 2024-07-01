import { describe, it, expect, beforeAll } from 'vitest';
import { DBBookActions } from '$lib/server/db/books/actions';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBBooks, type BookEdit } from '$lib/server/db/books/books';
import { setupBookEditObjsForEqualityTest } from '$lib/db/obj';
import type { MaybePromise } from '@sveltejs/kit';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

async function testBooks(params: { id: number; cb_book: (b: BookEdit) => MaybePromise<void> }) {
	const { id, cb_book } = params;
	const dbBooks = DBBooks.fromDB(db);

	const book = await dbBooks.getBookEdit(id).executeTakeFirstOrThrow();

	const bookHist = await dbBooks.getBookHistEdit({ id: id }).executeTakeFirstOrThrow();

	await cb_book(book);
	await cb_book(bookHist);

	setupBookEditObjsForEqualityTest(book, bookHist);
	expect(book).toStrictEqual(bookHist);
}

describe('book actions', () => {
	it('should edit the book', async () => {
		const dbBookActions = DBBookActions.fromDB(db);
		const book = await db.selectFrom('book').select('id').executeTakeFirstOrThrow();
		await dbBookActions.editBook(
			{
				book: {
					comment: 'Test',
					hidden: false,
					locked: false,
					editions: [],
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'おはよ',
						},
					],
					description: 'Hello',
					release_date: 99999999,
					olang: 'ja',
				},
				id: book.id,
			},
			ranobeBot,
		);
		testBooks({
			id: book.id,
			cb_book: (b) => {
				expect(b.description).toBe('Hello');
				expect(b.editions.length).toBe(0);
				expect(b.titles.length).toBe(1);
			},
		});
	});

	it('should add a book', async () => {
		const dbBookActions = DBBookActions.fromDB(db);
		const staff = await db
			.selectFrom('staff')
			.innerJoin('staff_alias', 'staff.id', 'staff_alias.staff_id')
			.select(['staff.id', 'staff_alias.id as aid'])
			.executeTakeFirstOrThrow();
		const addedBookId = await dbBookActions.addBook(
			{
				book: {
					comment: 'Test',
					hidden: false,
					locked: false,
					editions: [
						{
							lang: null,
							title: 'Ofiicial edition',
							staff: [
								{
									name: '',
									note: '',
									role_type: 'artist',
									staff_alias_id: staff.aid,
									staff_id: staff.id,
								},
							],
						},
					],
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'My Book',
						},
					],
					release_date: 99999999,
					olang: 'ja',
				},
			},
			ranobeBot,
		);

		testBooks({
			id: addedBookId,
			cb_book: (b) => {
				expect(b.titles.length).toBe(1);
				expect(b.editions.length).toBe(1);
				expect(b.editions[0].staff.length).toBe(1);
			},
		});
	});
});
