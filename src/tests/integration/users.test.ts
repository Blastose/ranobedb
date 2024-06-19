import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase } from './test-setup';
import { DBUsers } from '$lib/server/db/user/user';
import { DBListActions } from '$lib/server/db/user/list';
import { DBBookActions } from '$lib/server/db/books/actions';
import { DBChanges } from '$lib/server/db/change/change';
import { deletedUser } from '$lib/server/db/user/ranobebot';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

describe('users', () => {
	it('should create a user', async () => {
		const dbUsers = new DBUsers(db);
		const userId = 'lskfj';
		await dbUsers.deleteUser({ userId });

		const username = 'MyUserName';
		const email = 'myemail@email.com';
		await dbUsers.createUser({
			email,
			password: 'alsjedljiklkajskjfld',
			id: userId,
			username,
		});

		let userFromDb = await dbUsers.getUserFull(username);
		expect(userFromDb?.username).toBe(username);

		userFromDb = await dbUsers.getUserFull(email);
		expect(userFromDb?.email).toBe(email);
		if (!userFromDb) {
			throw Error('');
		}

		const notUserFromDb = await dbUsers.getUserFull('randomtexthere');
		expect(notUserFromDb).toBeUndefined();

		const newUsername = 'Yippee';
		await dbUsers.changeUsername({ userId: userFromDb.user_id, newUsername });
		userFromDb = await dbUsers.getUserFull(newUsername);
		expect(userFromDb?.username).toBe(newUsername);
	});

	it('should delete a user', async () => {
		// Deleting a user should change all of the user's edits to the Deleted user,
		// so we add a book and check if it does so correctly
		const dbUsers = new DBUsers(db);
		const userId = 'byeeee';
		await dbUsers.deleteUser({ userId });

		const username = 'efsefsefsefsed';
		const email = 'byeeee@email.com';
		const createdUser = await dbUsers.createUser({
			email,
			password: 'byeeeebyeeeebyeeee',
			id: userId,
			username,
		});

		const book = await db.selectFrom('book').selectAll().executeTakeFirstOrThrow();

		await new DBListActions(db).addBookToList({
			bookId: book.id,
			finished: null,
			labelIds: [],
			notes: '',
			readingStatusId: 1,
			score: null,
			started: null,
			userId: userId,
		});

		const addedBookId = await DBBookActions.fromDB(db).addBook(
			{
				book: {
					comment: '',
					editions: [],
					hidden: false,
					locked: false,
					olang: 'ja',
					release_date: 99999999,
					titles: [{ lang: 'ja', official: true, title: 'Title' }],
				},
			},
			createdUser,
		);

		const dbChanges = new DBChanges(db);
		let changeBook = await dbChanges.getChanges('book', addedBookId).executeTakeFirstOrThrow();
		expect(changeBook.user_id).toBe(userId);
		await dbUsers.deleteUser({ userId });

		changeBook = await dbChanges.getChanges('book', addedBookId).executeTakeFirstOrThrow();
		expect(changeBook.user_id).toBe(deletedUser.id);
	});
});
