import { expect, test } from '@playwright/test';

test.describe('add/edit/remove publisher from favorite list', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('user can add, update, and remove publisher from favorite list', async ({ page }) => {
		await page.goto('/publisher/1');
		await page.getByRole('button', { name: 'favorite' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Favorited publisher!');

		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: 'publishers (1)' }).click();
		await expect(page.getByText('ツギクル')).toBeVisible();

		await page.goto('/publisher/1');
		await page.getByRole('button', { name: 'favorited' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Unfavorited publisher!');

		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: 'publishers (0)' }).click();
		await expect(page.getByText('ツギクル')).not.toBeVisible();
	});
});
