import { expect, test } from '@playwright/test';

test.describe('edit book', () => {
	test.use({ storageState: 'storage-state/storageStateA.json' });

	test('User can edit book', async ({ page }) => {
		await page.goto('/book/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.bg-green-300')).toHaveText('Edited entry successfully!');
	});
});

test.describe('edit book invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('User cannot edit book due to invalid permissions', async ({ page }) => {
		await page.goto('/book/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.bg-red-300')).toHaveText(
			'Insufficient permission. Unable to edit.'
		);
	});
});
