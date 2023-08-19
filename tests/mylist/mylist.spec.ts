import { expect, test } from '@playwright/test';

test.describe('add/edit/remove books from my list', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('user can add, update, and remove books from reading list', async ({ page }) => {
		await page.goto('/book/1032');

		await page.locator('main').getByRole('button', { name: 'Add' }).click();
		await page.getByLabel('Start date').fill('2020-11-12');
		await page.getByLabel('Finish date').fill('2020-12-12');
		await page.getByLabel('Status').selectOption('Finished');
		await page.getByRole('dialog').getByRole('button', { name: 'Add' }).click();
		await page.goto('/');
		await page.goto('/book/1032');
		await expect(page.locator('main button.add-button')).toHaveText('Finished');

		await page.locator('main').getByRole('button', { name: 'Finished' }).click();
		await page.getByLabel('Start date').fill('');
		await page.getByLabel('Finish date').fill('2020-12-31');
		await page.getByLabel('Status').selectOption('Plan to read');
		await page.getByRole('dialog').getByRole('button', { name: 'Update' }).click();
		await page.goto('/');
		await page.goto('/book/1032');
		await expect(page.locator('main button.add-button')).toHaveText('Plan to read');

		await page.locator('main').getByRole('button', { name: 'Plan to read' }).click();
		page.on('dialog', (dialog) => dialog.accept());
		await page.getByRole('dialog').getByRole('button', { name: 'Remove' }).click();
		await expect(page.locator('main button.add-button')).toHaveText('Add');
	});
});
