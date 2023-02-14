import { expect, test } from '@playwright/test';

test.describe('edit person', () => {
	test.use({ storageState: 'storage-state/storageStateA.json' });

	test('User can edit person', async ({ page }) => {
		await page.goto('/person/1022/edit');
		await page.locator('input#name').fill('雨宮 むぎ');
		await page.locator('input#nameRomaji').fill('Amamiya Mugi');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.success')).toHaveText('Edited person successfully!');
	});
});

test.describe('edit person invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('User cannot edit person due to invalid permissions', async ({ page }) => {
		await page.goto('/person/3038/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Insufficient permission. Unable to edit.'
		);
	});
});
