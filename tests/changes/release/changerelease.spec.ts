import { expect, test } from '@playwright/test';

test.describe('edit release mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can edit release', async ({ page }) => {
		await page.goto('/release/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/release/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited release!');
	});

	test('Mod can edit locked release', async ({ page }) => {
		await page.goto('/release/2/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/release/2');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited release!');
	});
});

test.describe('edit release user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit release due to invalid permissions', async ({ page, request }) => {
		await page.goto('/release/1/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/release/1/edit', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('edit release editor invalid permissions locked', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('Editor cannot edit locked release due to invalid permissions', async ({
		page,
		request,
	}) => {
		await page.goto('/release/2');
		await expect(page.getByText('Locked')).toBeVisible();
		await page.goto('/release/2/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/release/2/edit', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('add release mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can add release', async ({ page }) => {
		await page.goto('/releases/add');
		await page.getByLabel('Title').fill('にゃんこちゃんができる！');
		await page.getByLabel('Romanization').fill('Nyanko-chan ga Dekiru!');
		await page.getByLabel('Note').fill('Nyanko is a fictional release.');
		await page.getByLabel('Release date').selectOption('2023');
		await page.locator('select').nth(3).selectOption('4');
		await page.locator('select').nth(4).selectOption('8');
		await page.getByLabel('Add book').click();
		await page.getByLabel('Add book').fill('Chivalry of a Failed Knight');
		await page.getByText('#16 Chivalry of a Failed Knight: Volume 2').click();
		await page.getByLabel('Type: completepartial').selectOption('partial');
		await page.getByLabel('Add publisher').click();
		await page.getByLabel('Add publisher').fill('kado');
		await page.getByText('#12 KADOKAWA').click();
		await page.getByLabel('Type: imprintpublisher').selectOption('publisher');

		await page.getByLabel('Edit summary').fill('Add Nyanko');

		await page.getByRole('button', { name: 'Submit' }).click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added release!');
	});

	test('Mod cannot add release without filling in required fields', async ({ page }) => {
		await page.goto('/releases/add');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/releases/add');
	});
});

test.describe('add release user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot add release due to invalid permissions', async ({ page, request }) => {
		await page.goto('/releases/add');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/releases/add', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});
