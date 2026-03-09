import { expect, test } from '@playwright/test';

test.describe('set default release filters', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('User can set their default release filters', async ({ page }) => {
		await page.goto('/releases');
		await page.getByRole('heading', { name: 'Filters' }).click();
		await page.getByRole('combobox', { name: 'Release language' }).click();
		await page.getByRole('option', { name: 'English' }).click();
		await page.getByRole('combobox', { name: 'Release format' }).click();
		await page.getByRole('option', { name: 'digital' }).click();
		await page.getByRole('combobox', { name: 'Add publisher' }).click();
		await page.getByRole('combobox', { name: 'Add publisher' }).fill('yen press');
		await page.getByText('Yen Press').click();
		await page.getByRole('button', { name: 'Search' }).click();
		await page.getByRole('button', { name: 'Save current filters as default' }).click();
		await page.getByRole('button', { name: 'Save', exact: true }).click();

		await page.goto('/');
		await page.getByRole('link', { name: 'View all' }).nth(2).click();
		await expect(page).toHaveURL(/rf=digital/);
		await page.goto('/');
		await page.getByRole('link', { name: 'View all' }).nth(3).click();
		await expect(page).toHaveURL(/rf=digital/);
		await page.goto('/releases');
		await expect(page).toHaveURL(/rf=digital/);
	});
});
