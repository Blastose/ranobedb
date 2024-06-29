import { expect, test } from '@playwright/test';

test.describe('edit series mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can edit series', async ({ page }) => {
		await page.goto('/series/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/series/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited series!');
	});

	test('Mod can edit locked series', async ({ page }) => {
		await page.goto('/series/2/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/series/2');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited series!');
	});

	test('Mod can edit series with relations', async ({ page }) => {
		await page.goto('/series/3/edit');

		await page.getByLabel('Add book').click();
		await page.getByLabel('Add book').fill('f');
		await page.getByText('#16 Chivalry of a Failed Knight: Volume 2').click();
		await page.getByLabel('Add series').click();
		await page.getByLabel('Add series').fill('f');
		await page.getByText('#19 Ascendance of a Bookworm: Fanbook').click();
		await page.getByLabel('Edit summary').fill('Add relations');
		await page.getByRole('button', { name: 'Submit edit' }).click();
		await expect(page.locator('.toast-container').first()).toHaveText(
			'Successfully edited series!',
		);
		await page.getByRole('link', { name: 'Edit', exact: true }).click();
		await page
			.getByLabel('Relation type: parent storyprequelsequelside storymain storyspin-off')
			.selectOption('main story');
		await page.getByPlaceholder('Summarize the changes you have made').fill('Change relation type');
		await page.getByLabel('Edit summary').fill('Change relation type');
		await page.getByRole('button', { name: 'Submit edit' }).click();

		await expect(page).toHaveURL('/series/3');
		await expect(page.locator('.toast-container').first()).toHaveText(
			'Successfully edited series!',
		);
	});
});

test.describe('edit series user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit series due to invalid permissions', async ({ page, request }) => {
		await page.goto('/series/1/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/series/1/edit', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('edit series editor invalid permissions locked', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('Editor cannot edit locked series due to invalid permissions', async ({ page, request }) => {
		await page.goto('/series/2');
		await expect(page.getByText('Locked')).toBeVisible();
		await page.goto('/series/2/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/series/2/edit', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('add series mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can add series', async ({ page }) => {
		await page.goto('/series/add');
		await page.getByLabel('Japanese', { exact: true }).fill('Hello World Series!');
		await page.getByLabel('Edit summary').fill('Add series');
		await page.getByRole('button', { name: 'Submit' }).click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added series!');
	});

	test('Mod cannot add series without filling in required fields', async ({ page }) => {
		await page.goto('/series/add');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/series/add');
	});
});

test.describe('add series user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot add series due to invalid permissions', async ({ page, request }) => {
		await page.goto('/series/add');
		await expect(page.locator('h1')).toHaveText('Access Denied');
		const response = await request.post('/series/add', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});
