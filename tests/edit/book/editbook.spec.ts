import { expect, test } from '@playwright/test';

test.describe('edit book', () => {
	test.use({ storageState: 'storage-state/storageStateA.json' });

	test('User can edit book', async ({ page }) => {
		await page.goto('/book/2/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.success')).toHaveText('Edited book successfully!');
	});

	test('User can add and remove people relations to book', async ({ page }) => {
		await page.goto('/book/5059/edit');

		await page.locator('input#search-people-edit-book').fill('s');
		await page.getByRole('button', { name: '語部マサユキ' }).click();
		await page.locator('select#role3002artist').selectOption({ label: 'author' });
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited book successfully!');

		await page.goto('/book/5059');
		await expect(page.getByText('語部マサユキ')).toBeVisible();

		await page.goto('/book/5059/edit');
		await page.locator('label[for="role3002author"] ~ button.remove-button').click();
		await page.locator('main form button[type="submit"]').click();
		await expect(page.locator('div.alert.success')).toHaveText('Edited book successfully!');

		await page.goto('/book/5059');
		await expect(page.getByText('語部マサユキ')).not.toBeVisible();
	});

	test('User cannot have duplicate person in DB relations', async ({ page }) => {
		await page.goto('/book/5059/edit');

		await page.locator('select#role1025author').selectOption({ label: 'artist' });
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Invalid form entries. Unable to edit!'
		);

		await expect(
			page.getByText('Duplicate people with same roles in form. Remove duplicates and try again.')
		).toBeVisible();
	});
});

test.describe('edit book invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateAA.json' });

	test('User cannot edit book due to invalid permissions', async ({ page }) => {
		await page.goto('/book/5059/edit');
		await page.locator('main form button[type="submit"]').click();

		await expect(page.locator('div.alert.error')).toHaveText(
			'Insufficient permission. Unable to edit.'
		);
	});
});
