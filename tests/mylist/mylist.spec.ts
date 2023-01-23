import { expect, test } from '@playwright/test';

test.describe('add/edit/remove books from my list', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('user can update books from reading list', async ({ page }) => {
		await page.goto('/my-list');
		await expect(page).toHaveURL('/my-list');

		await page.goto('/book/1031');
		await page.locator('main button.add-button').click();

		await page.getByLabel('Start date').fill('2020-11-12');
		await page.getByLabel('Finish date').fill('2020-12-12');
		await page.getByLabel('Status').selectOption('Plan to read');
		await page.locator('button[type="submit"][value="update"]').click();

		await expect(page.locator('main button.add-button')).toHaveText('Plan to read');
	});

	test('user can add and remove books from reading list', async ({ page }) => {
		await page.goto('/my-list');
		await expect(page).toHaveURL('/my-list');

		await page.goto('/book/1032');
		await page.locator('main button.add-button').click();

		await page.getByLabel('Start date').fill('2020-11-12');
		await page.getByLabel('Finish date').fill('2020-12-12');
		await page.getByLabel('Status').selectOption('Finished');
		await page.locator('button[type="submit"][value="add"]').click();

		await expect(page.locator('main button.add-button')).toHaveText('Finished');

		await page.locator('main button.add-button').click();
		page.on('dialog', (dialog) => dialog.accept());
		await page.locator('button[type="submit"][value="remove"]').click();

		await expect(page.locator('main button.add-button')).toHaveText('Add');
	});
});
