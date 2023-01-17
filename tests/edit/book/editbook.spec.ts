import { expect, test } from '@playwright/test';

test.describe('edit book', () => {
	test.use({ storageState: 'storageState.json' });

	test('User can edit book', async ({ page }) => {
		await page.goto('/book/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.bg-green-300')).toHaveText('Edited entry successfully!');
	});
});
