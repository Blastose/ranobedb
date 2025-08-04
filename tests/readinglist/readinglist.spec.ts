import { expect, test } from '@playwright/test';

test.describe('add/edit/remove books from reading list', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('user can add, update, and remove books from reading list', async ({ page }) => {
		await page.goto('/book/1');

		await page.locator('main').getByRole('button', { name: 'Add to reading list' }).click();
		await page.getByLabel('Started').fill('2020-11-12');
		await page.getByLabel('Finished', { exact: true }).fill('2020-12-12');
		await page.getByLabel('Reading status').selectOption('Finished');
		await page.getByLabel('Score').fill('4.6');
		await page.getByRole('dialog').getByRole('button', { name: 'Add' }).click();
		await page.goto('/');
		await page.goto('/book/1');
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Finished');

		await page.locator('main').getByRole('button', { name: 'Finished' }).click();
		await page.getByLabel('Started').fill('');
		await page.getByLabel('Finished', { exact: true }).fill('2020-12-31');
		await page.getByLabel('Reading status').selectOption('Plan to read');
		await page.getByLabel('Score').fill('10');
		await page.getByRole('dialog').getByRole('button', { name: 'Update' }).click();
		await page.goto('/');
		await page.goto('/book/1');
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Plan to read');

		await page.locator('main').getByRole('button', { name: 'Plan to read' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Remove from list' }).click();
		await page.getByRole('button', { name: 'Delete' }).click();
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText(
			'Add to reading list',
		);
	});
});
