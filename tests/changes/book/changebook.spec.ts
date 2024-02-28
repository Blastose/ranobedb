import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/db/dbTypes';

dotenv.config();

const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL
		})
	})
});

test.describe('edit book mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can edit book', async ({ page }) => {
		await page.goto('/book/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/book/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited book!');
	});

	test('Mod can edit locked books', async ({ page }) => {
		await page.goto('/book/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/book/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited book!');
	});
});

test.describe('edit book user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit book due to invalid permissions', async ({ page }) => {
		await page.goto('/book/1/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});

test.describe('edit book editor invalid permissions locked', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('Editor cannot edit locked book due to invalid permissions', async ({ page }) => {
		await page.goto('/book/2');
		await expect(page.getByText('This book is locked from editing')).toBeVisible();
		await page.goto('/book/2/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});

test.describe('add book mod', () => {
	const deleteText = 'delete me after';

	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test.afterAll(async () => {
		await db.transaction().execute(async (trx) => {
			const bookIds = (
				await trx
					.selectFrom('book')
					.where('book.description', '=', deleteText)
					.select('book.id')
					.execute()
			).map((item) => item.id);
			const changeIds = (
				await trx
					.selectFrom('change')
					.where('change.item_id', 'in', bookIds)
					.select(['change.id'])
					.execute()
			).map((item) => item.id);
			await trx.deleteFrom('book_title').where('book_title.book_id', 'in', bookIds).execute();
			await trx
				.deleteFrom('book_title_hist')
				.where('book_title_hist.change_id', 'in', changeIds)
				.execute();
			await trx.deleteFrom('book_hist').where('book_hist.change_id', 'in', changeIds).execute();
			await trx.deleteFrom('book').where('book.id', 'in', bookIds).execute();
			await trx.deleteFrom('change').where('change.id', 'in', changeIds).execute();
		});
	});

	test('Mod can add book', async ({ page }) => {
		await page.goto('/books/add');
		await page.getByLabel('Japanese', { exact: true }).fill('Hello World!');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.getByLabel('Description', { exact: true }).fill(deleteText);
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added book!');
	});

	test('Mod cannot add book without filling in required fields', async ({ page }) => {
		await page.goto('/books/add');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/books/add');
	});
});

test.describe('add book user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit book due to invalid permissions', async ({ page }) => {
		await page.goto('/books/add');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});
