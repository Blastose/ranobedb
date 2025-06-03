import { expect, test } from '@playwright/test';

test.describe('add/edit/remove staff from follow list', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('user can add, update, and remove staff from follow list', async ({ page }) => {
		await page.goto('/staff/1');

		await page.getByRole('button', { name: 'Follow' }).click();
		await page.getByLabel('Follow staff').getByRole('button', { name: 'Follow' }).click();
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Following');

		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: 'Staff (1)' }).click();
		await expect(page.getByText('CONACO')).toBeVisible();

		await page.goto('/staff/1');
		await page.getByRole('button', { name: 'Following' }).click();
		await page.getByRole('combobox', { name: 'Release language is one of' }).click();
		await page.getByRole('option', { name: 'Japanese' }).click();
		await page.getByRole('combobox', { name: 'Release language is one of' }).click();
		await page.getByRole('combobox', { name: 'Release format is one of' }).click();
		await page.getByRole('option', { name: 'print' }).click();
		await page.getByRole('combobox', { name: 'Release format is one of' }).click();
		await page.getByText('Only notify me when a release').click();
		await page.getByRole('button', { name: 'Update' }).click();
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Following');
		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: 'Staff (1)' }).click();
		await expect(page.getByText('CONACO')).toBeVisible();

		await page.goto('/staff/1');
		await page.getByRole('button', { name: 'Following' }).click();
		await page.getByRole('button', { name: 'Unfollow' }).click();
		await page.getByLabel('Warning').getByRole('button', { name: 'Unfollow' }).click();
		await expect(page.locator('main button[aria-haspopup="dialog"]')).toHaveText('Follow');
		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: 'Staff (0)' }).click();
		await expect(page.getByText('CONACO')).not.toBeVisible();
	});
});
