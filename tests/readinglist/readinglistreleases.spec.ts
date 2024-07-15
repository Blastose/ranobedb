import { expect, test } from '@playwright/test';

test.describe('add/edit/remove releases from release collection', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('user can add, update, and remove books from release collection', async ({ page }) => {
		await page.goto('/book/3');

		await page.getByLabel('Open release options').first().click();
		await page.getByRole('menuitem', { name: 'owned' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Added release to list!');
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Reading');

		await page.goto('/release/3');
		await page.getByLabel('Open release options').first().click();
		await page.getByRole('menuitem', { name: 'deleted' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Updated release successfully!',
		);

		await page.getByLabel('Open release options').click();
		await page.getByRole('menuitem', { name: 'Remove' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Removed release from list!');
		await expect(page.locator('dd').filter({ hasText: 'Not in your collection' })).toBeVisible();

		await page.goto('/release/4');
		await page.getByLabel('Open release options').click();
		await page.getByRole('menuitem', { name: 'owned' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Added release to list!');
		await page.goto('/book/3');
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Reading');

		await page.locator('main').getByRole('button', { name: 'Reading' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Remove from list' }).click();
		await page.getByRole('button', { name: 'Delete' }).click();
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText(
			'Add to reading list',
		);

		await page.goto('/release/4');
		await expect(page.locator('dd').filter({ hasText: 'Not in your collection' })).toBeVisible();
	});
});
