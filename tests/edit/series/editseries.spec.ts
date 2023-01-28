import { expect, test } from '@playwright/test';

test.describe('edit series', () => {
	test.use({ storageState: 'storage-state/storageStateA.json' });

	test('User can edit series', async ({ page }) => {
		await page.goto('/series/3/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.success')).toHaveText('Edited entry successfully!');
	});

	test('User can add and remove book relations to series', async ({ page }) => {
		await page.goto('/series/3/edit');

		await page.locator('input#search-book-edit-series').fill('b');
		await page.getByRole('button', { name: 'id1037: 朝比奈若葉と○○な彼氏' }).click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited entry successfully!');

		await page.goto('/series/3');
		await expect(page.getByText('朝比奈若葉と○○な彼氏')).toBeVisible();

		await page.goto('/series/3/edit');
		// Removes 朝比奈若葉と○○な彼氏 by deleting the first item of the list
		// Might be a better way by matching the string an finding the sibling button
		await page.locator('div.list-item > p + input + button.remove-button').first().click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited entry successfully!');

		await page.goto('/series/3');
		await expect(page.getByText('朝比奈若葉と○○な彼氏')).not.toBeVisible();
	});
});

test.describe('edit series invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('User cannot edit series due to invalid permissions', async ({ page }) => {
		await page.goto('/series/3/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Insufficient permission. Unable to edit.'
		);
	});
});
