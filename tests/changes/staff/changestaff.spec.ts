import { expect, test } from '@playwright/test';

test.describe('edit staff mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can edit staff', async ({ page }) => {
		await page.goto('/staff/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/staff/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited staff!');
	});

	test('Mod can edit locked staff', async ({ page }) => {
		await page.goto('/staff/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/staff/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited staff!');
	});
});

test.describe('edit staff user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit staff due to invalid permissions', async ({ page }) => {
		await page.goto('/staff/1/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});

test.describe('edit staff editor invalid permissions locked', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('Editor cannot edit locked staff due to invalid permissions', async ({ page }) => {
		await page.goto('/staff/2');
		await expect(page.getByText('Locked')).toBeVisible();
		await page.goto('/staff/2/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});

test.describe('add staff mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can add staff', async ({ page }) => {
		await page.goto('/staff/add');
		await page.getByLabel('Name (in original script)').fill('あざせかい');
		await page.getByLabel('Romanization').fill('Asasekai');
		await page.getByRole('button', { name: 'Add alias' }).click();
		await page.getByLabel('Name (in original script)').nth(1).fill('Jimmy');
		await page.getByLabel('Biography').fill('Jimmy is a great man');
		await page.getByLabel('Edit summary').fill('Add Jimmy');
		await page.getByRole('button', { name: 'Submit' }).click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added staff!');
	});

	test('Mod cannot add staff without filling in required fields', async ({ page }) => {
		await page.goto('/staff/add');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/staff/add');
	});
});

test.describe('add staff user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit staff due to invalid permissions', async ({ page }) => {
		await page.goto('/staff/add');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});
