import { expect, test } from '@playwright/test';

test.describe('edit publisher mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can edit publisher', async ({ page }) => {
		await page.goto('/publisher/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/publisher/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited publisher!');
	});

	test('Mod can edit publisher with publisher relations', async ({ page }) => {
		await page.goto('/publisher/3/edit');

		await page.getByLabel('Add publisher').click();
		await page.getByLabel('Add publisher').fill('kado');
		await page.getByText('#4 KADOKAWA').click();
		await page.getByLabel('Edit summary').fill('Add KADOKAWA');
		await page.getByRole('button', { name: 'Submit edit' }).click();
		await expect(page.locator('.toast-container').first()).toHaveText(
			'Successfully edited publisher!'
		);
		await page.getByRole('link', { name: 'Edit' }).click();
		await page
			.getByLabel('Relation type: imprintparent brandparent companysubsidiary')
			.selectOption('parent brand');
		await page.getByLabel('Edit summary').fill('Change relation type');
		await page.getByRole('button', { name: 'Submit edit' }).click();

		await expect(page).toHaveURL('/publisher/3');
		await expect(page.locator('.toast-container').first()).toHaveText(
			'Successfully edited publisher!'
		);
	});

	test('Mod can edit locked publisher', async ({ page }) => {
		await page.goto('/publisher/1/edit');
		await page.getByLabel('Edit summary').fill('Add change');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/publisher/1');
		await expect(page.locator('.toast-container')).toHaveText('Successfully edited publisher!');
	});
});

test.describe('edit publisher user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit publisher due to invalid permissions', async ({ page }) => {
		await page.goto('/publisher/1/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});

test.describe('edit publisher editor invalid permissions locked', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('Editor cannot edit locked publisher due to invalid permissions', async ({ page }) => {
		await page.goto('/publisher/2');
		await expect(page.getByText('Locked')).toBeVisible();
		await page.goto('/publisher/2/edit');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});

test.describe('add publisher mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can add publisher', async ({ page }) => {
		await page.goto('/publishers/add');
		await page.getByLabel('Name').fill('にゃんこ');
		await page.getByLabel('Romanization').fill('Nyanko');
		await page.getByLabel('Biography').fill('Nyanko is a fictional publisher.');
		await page.getByLabel('Edit summary').fill('Add Nyanko');
		await page.getByLabel('Add publisher').click();
		await page.getByLabel('Add publisher').fill('kado');
		await page.getByText('#4 KADOKAWA').click();
		await page.getByRole('button', { name: 'Submit' }).click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added publisher!');

		await page.goto('/publisher/4');
		await expect(page.getByText('Parent Brand: にゃんこ')).toBeVisible();
	});

	test('Mod cannot add publisher without filling in required fields', async ({ page }) => {
		await page.goto('/publishers/add');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/publishers/add');
	});
});

test.describe('add publisher user invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot edit publisher due to invalid permissions', async ({ page }) => {
		await page.goto('/publishers/add');
		await expect(page.locator('h1')).toHaveText('Access Denied');
	});
});
