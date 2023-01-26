import { expect, test } from '@playwright/test';

test.describe('edit publisher', () => {
	test.use({ storageState: 'storage-state/storageStateA.json' });

	test('User can edit publisher', async ({ page }) => {
		await page.goto('/publisher/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.success')).toHaveText('Edited entry successfully!');
	});

	test('User can add and remove publisher relations to publisher', async ({ page }) => {
		await page.goto('/publisher/52/edit');

		await page.locator('input#search-publisher-edit-publisher').fill('m');
		await page.getByRole('button', { name: 'MF文庫J' }).click();
		await page.locator('select#type13label').selectOption({ label: 'subsidiary' });
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited entry successfully!');

		await page.goto('/publisher/52');
		await expect(page.getByText('MF文庫J')).toBeVisible();

		await page.goto('/publisher/52/edit');
		await page.locator('label[for="type13subsidiary"] ~ button.remove-button').click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited entry successfully!');

		await page.goto('/publisher/52');
		await expect(page.getByText('MF文庫J')).not.toBeVisible();
	});

	test('User cannot have duplicate publisher in DB relations', async ({ page }) => {
		await page.goto('/publisher/1/edit');

		await page.locator('input#search-publisher-edit-publisher').fill('k');
		await page.getByRole('button', { name: '角川書店' }).click();
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Invalid form entries. Unable to edit!'
		);

		await expect(
			page.getByText('Duplicate publishers in form. Remove duplicates and try again.')
		).toBeVisible();
	});
});

test.describe('publisher book invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('User cannot edit publisher due to invalid permissions', async ({ page }) => {
		await page.goto('/publisher/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Insufficient permission. Unable to edit.'
		);
	});
});
