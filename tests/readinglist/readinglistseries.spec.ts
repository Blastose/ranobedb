import { expect, test } from '@playwright/test';

test.describe('add/edit/remove series from reading list', () => {
	test.use({ storageState: 'storage-state/storageStateEditor.json' });

	test('user can add, update, and remove series from reading list', async ({ page }) => {
		await page.goto('/series/14');
		await page.locator('main').getByRole('button', { name: 'Add to reading list' }).click();
		await page.getByLabel('Reading status').selectOption('Plan to read');
		await page.getByLabel('Release language is one of').click();
		await page.getByRole('option', { name: 'Japanese' }).click();
		await page.getByLabel('Release format is one of').click();
		await page.getByRole('option', { name: 'print' }).click();
		await page.getByLabel('Release format is one of').click();
		await page
			.getByLabel('Add series to reading list')
			.getByRole('button', { name: 'Add to reading list' })
			.click();
		await expect(page.locator('.toast-container').last()).toHaveText('Added series to list!');
		await expect(page.getByRole('button', { name: 'Plan to read' })).toBeVisible();

		// Add series from adding release
		await page.goto('/release/21');
		await page.getByLabel('Open release options').first().click();
		await page.getByRole('menuitem', { name: 'owned' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Added release to list!');

		// Book also added
		await page.goto('/book/16');
		await expect(page.getByRole('button', { name: 'Reading' })).toBeVisible();
		// Series also added
		await page.goto('/series/9');
		await expect(page.getByRole('button', { name: 'Reading' })).toBeVisible();

		// Remove series from list
		await page.getByRole('button', { name: 'Reading' }).click();
		await page.getByRole('button', { name: 'Remove from list' }).click();
		await page.getByRole('button', { name: 'Delete' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Removed series from list!');
		// Check if book is also removed
		await page.goto('/book/16');
		await expect(
			page.locator('main').getByRole('button', { name: 'Add to reading list' }),
		).toBeVisible();
		// Check if release is also removed
		await page.goto('/release/21');
		await expect(page.locator('dd').filter({ hasText: 'Not in your collection' })).toBeVisible();
	});
});
