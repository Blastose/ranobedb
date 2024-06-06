import { describe, it, expect, beforeAll } from 'vitest';
import { DBBookActions } from '$lib/server/db/books/actions';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBBooks } from '$lib/server/db/books/books';
import { setupBookEditObjsForEqualityTest } from '$lib/db/obj';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

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
		const dbBooks = DBBooks.fromDB(db);
		const changedBook = await dbBooks.getBookEdit(book.id).executeTakeFirstOrThrow();
		expect(changedBook.description).toBe('Hello');
		expect(changedBook.editions.length).toBe(0);
		expect(changedBook.titles.length).toBe(1);
		const changedBookHist = await dbBooks
			.getBookHistEdit({ id: book.id })
			.executeTakeFirstOrThrow();
		setupBookEditObjsForEqualityTest(changedBook, changedBookHist);
		expect(changedBookHist).toStrictEqual(changedBook);
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
		const dbBooks = DBBooks.fromDB(db);
		const addedBook = await dbBooks.getBookEdit(addedBookId).executeTakeFirstOrThrow();
		expect(addedBook.titles.length).toBe(1);
		expect(addedBook.editions.length).toBe(1);
		expect(addedBook.editions[0].staff.length).toBe(1);

		const addedBookHist = await dbBooks
			.getBookHistEdit({ id: addedBookId })
			.executeTakeFirstOrThrow();
		setupBookEditObjsForEqualityTest(addedBook, addedBookHist);
		expect(addedBookHist).toStrictEqual(addedBook);
	});
});
