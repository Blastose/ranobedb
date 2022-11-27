import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('switch theme button switches themes', async ({ page }) => {
	const locator = page.locator('html');
	await page.locator('[aria-label="switch theme to dark"]').click();
	await expect(locator).toHaveClass('dark');

	await page.locator('[aria-label="switch theme to light"]').click();
	await expect(locator).not.toHaveClass('dark');
});

test('sidebar close button closes sidebar', async ({ page }) => {
	await page.locator('[aria-label="close sidebar"]').click();
	const locator = page.locator('.main > .sidebar');
	await expect(locator).toHaveCSS('margin-left', '-256px');
});

test('menu button opens sidebar', async ({ page }) => {
	await page.locator('[aria-label="close sidebar"]').click();
	const locator = page.locator('.main > .sidebar');
	await expect(locator).toHaveCSS('margin-left', '-256px');

	await page.locator('button:visible[aria-label="open sidebar"]').click();
	await expect(locator).toHaveCSS('margin-left', '0px');
});

test('profile button opens profile menu', async ({ page }) => {
	await page.locator('[aria-label="open profile menu"]').click();
	const locator = page.locator('.header nav.menu');
	await expect(locator).toBeVisible();
});

test('clicking outside closes profile menu', async ({ page }) => {
	await page.locator('[aria-label="open profile menu"]').click();
	const locator = page.locator('.header nav.menu');
	await expect(locator).toBeVisible();

	await page.locator('body').click();
	await expect(locator).toBeHidden();
});
