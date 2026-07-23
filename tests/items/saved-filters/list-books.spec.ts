import { expect, test } from '@playwright/test';

test.describe('saved filters list books', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('can save and auto-load default filter', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: /^Books \(\d+\)$/ }).click();
		await page.getByRole('heading', { name: 'Filters' }).click();
		await page.getByRole('combobox', { name: 'Release language', exact: true }).click();
		await page.getByRole('option', { name: 'English' }).click();
		await page.keyboard.press('Escape');
		await page.getByRole('combobox', { name: 'Release format', exact: true }).click();
		await page.getByRole('option', { name: 'digital' }).click();
		await page.keyboard.press('Escape');
		await page.getByRole('button', { name: 'Search' }).click();
		await page.getByRole('button', { name: 'Manage saved filters' }).click();
		await page.getByLabel('Filter name').fill('Default');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		await expect(page.getByText('Saved filters as "Default"!')).toBeVisible();
		await page.goto('/');
		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: /^Books \(\d+\)$/ }).click();
		await page.getByRole('heading', { name: 'Filters' }).click();
		await page.getByRole('button', { name: 'Search' }).click();
		await expect(page).toHaveURL(/rf=digital/);
	});

	test('can save a custom-named filter', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: /^Books \(\d+\)$/ }).click();
		await page.getByRole('button', { name: 'Search' }).click();
		await page.getByRole('button', { name: 'Manage saved filters' }).click();
		await page.getByLabel('Filter name').fill('Custom list books filter');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		await expect(page.getByText('Saved filters as "Custom list books filter"!')).toBeVisible();
		await page.getByRole('button', { name: 'Manage saved filters' }).click();
		await expect(page.getByRole('link', { name: 'Custom list books filter' })).toBeVisible();
	});

	test('can delete a saved filter', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'My List' }).click();
		await page.getByRole('link', { name: /^Books \(\d+\)$/ }).click();
		await page.getByRole('button', { name: 'Search' }).click();
		await page.getByRole('button', { name: 'Manage saved filters' }).click();
		await page.getByLabel('Filter name').fill('To delete');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		await expect(page.getByText('Saved filters as "To delete"!')).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'Saved filters', exact: true }),
		).not.toBeVisible();
		await page.getByRole('button', { name: 'Manage saved filters' }).click();
		await expect(page.getByRole('link', { name: 'To delete' })).toBeVisible();
		const filterRow = page.getByRole('link', { name: 'To delete' }).locator('..');
		await filterRow.getByRole('button', { name: 'Delete' }).click();
		await page
			.getByRole('dialog', { name: 'Delete filter' })
			.getByRole('button', { name: 'Delete' })
			.click();
		await expect(page.getByRole('link', { name: 'To delete' })).not.toBeVisible();
	});
});
