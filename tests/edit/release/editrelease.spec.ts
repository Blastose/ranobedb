import { expect, test } from '@playwright/test';

test.describe('edit release', () => {
	test.use({ storageState: 'storage-state/storageStateA.json' });

	test('User can edit release', async ({ page }) => {
		await page.goto('/release/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.success')).toHaveText('Edited release successfully!');
	});

	test('User can add and remove publisher relations to release', async ({ page }) => {
		await page.goto('/release/1/edit');

		await page.locator('input#search-publisher-edit-release').fill('SQEXノベル');
		await page.getByRole('button', { name: 'id26: SQEXノベル' }).click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited release successfully!');

		await page.goto('/release/1');
		await expect(page.getByText('SQEXノベル')).toBeVisible();

		await page.goto('/release/1/edit');
		const publisherItemContainer = page.locator('div.list-container').first();
		await publisherItemContainer
			.locator('div.list-item > p + input + button.remove-button')
			.last()
			.click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited release successfully!');

		await page.goto('/release/1');
		await expect(page.getByText('SQEXノベル')).not.toBeVisible();
	});

	test('User can add and remove book relations to release', async ({ page }) => {
		await page.goto('/release/1/edit');

		await page.locator('input#search-book-edit-release').fill('asahina');
		await page.getByRole('button', { name: 'id1037: 朝比奈若葉と○○な彼氏' }).click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited release successfully!');

		await page.goto('/release/1');
		await expect(page.getByText('朝比奈若葉と○○な彼氏')).toBeVisible();

		await page.goto('/release/1/edit');
		const bookItemContainer = page.locator('div.list-container').last();
		await bookItemContainer
			.locator('div.list-item > p + input + button.remove-button')
			.last()
			.click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited release successfully!');

		await page.goto('/release/1');
		await expect(page.getByText('朝比奈若葉と○○な彼氏')).not.toBeVisible();
	});

	test('User cannot input more than 13 characters for ISBN', async ({ page }) => {
		await page.goto('/release/1/edit');

		await page.locator('input#isbn13').fill('123');
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.error')).toHaveText(
			'Invalid form entries. Unable to edit!'
		);
		await expect(page.locator('input#isbn13 + span')).toHaveText(
			'ISBN must be 13 characters or omitted'
		);
	});
});

test.describe('release book invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('User cannot edit release due to invalid permissions', async ({ page }) => {
		await page.goto('/release/1/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Insufficient permission. Unable to edit.'
		);
	});
});
