import { expect, test } from '@playwright/test';

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

	test('User cannot edit book due to invalid permissions', async ({ page, request }) => {
		await page.goto('/book/1/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/book/1/edit', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('edit book editor invalid permissions locked', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('Editor cannot edit locked book due to invalid permissions', async ({ page, request }) => {
		await page.goto('/book/2');
		await expect(page.getByText('Locked')).toBeVisible();
		await page.goto('/book/2/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/book/2/edit', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('add book mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can add book', async ({ page }) => {
		await page.goto('/books/add');
		await page.getByLabel('Japanese', { exact: true }).fill('Hello World!');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.getByLabel('Description', { exact: true }).fill('Description');
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

	test('User cannot add book due to invalid permissions', async ({ page, request }) => {
		await page.goto('/books/add');
		await expect(page.locator('h1')).toHaveText('Access Denied');

		const response = await request.post('/books/add', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});
