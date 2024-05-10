import { describe, it, expect, beforeAll } from 'vitest';
import { DBBooksActions } from '$lib/server/db/books/actions';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBBooks } from '$lib/server/db/books/books';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

describe('book actions', () => {
	it('should edit the book', async () => {
		const dbBooksActions = DBBooksActions.fromDB(db);
		const book = await db.selectFrom('book').select('id').executeTakeFirstOrThrow();
		await dbBooksActions.editBook(
			{
				book: {
					comment: 'Test',
					hidden: false,
					locked: false,
					staff: [],
					titles: [],
					description: 'Hello',
				},
				id: book.id,
			},
			ranobeBot,
		);
		const dbBooks = DBBooks.fromDB(db);
		const changedBook = await dbBooks.getBook(book.id).executeTakeFirstOrThrow();
		expect(changedBook.description).toBe('Hello');
		expect(changedBook.staff.length).toBe(0);
		expect(changedBook.titles.length).toBe(0);
	});

	it('should add a book', async () => {
		const dbBooksActions = DBBooksActions.fromDB(db);
		const staff = await db
			.selectFrom('staff')
			.innerJoin('staff_alias', 'staff.id', 'staff_alias.id')
			.select(['staff.id', 'staff_alias.id as aid'])
			.executeTakeFirstOrThrow();
		const addedBookId = await dbBooksActions.addBook(
			{
				book: {
					comment: 'Test',
					hidden: false,
					locked: false,
					staff: [
						{
							name: '',
							note: '',
							role_type: 'artist',
							staff_alias_id: staff.aid,
							staff_id: staff.id,
						},
					],
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'My Book',
						},
					],
				},
			},
			ranobeBot,
		);
		const dbBooks = DBBooks.fromDB(db);
		const addedBook = await dbBooks.getBook(addedBookId).executeTakeFirstOrThrow();
		expect(addedBook.titles.length).toBe(1);
		expect(addedBook.staff.length).toBe(1);

		const addedBookHist = await dbBooks.getBookHist(addedBookId).executeTakeFirstOrThrow();
		expect(addedBookHist.titles.length).toBe(1);
		expect(addedBookHist.staff.length).toBe(1);
	});
});
