import { expect, test } from '@playwright/test';

test.describe('layout large screen', () => {
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
		await page.locator('button:visible[aria-label="close sidebar"]').click();
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

		await page.locator('.main > .sidebar').click();
		await expect(locator).toBeHidden();
	});
});

test.describe('layout small screen', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({
			width: 640,
			height: 480
		});
		await page.goto('/');
	});

	test('switch theme button switches themes', async ({ page }) => {
		const locator = page.locator('html');
		await page.locator('[aria-label="switch theme to dark"]').click();
		await expect(locator).toHaveClass('dark');

		await page.locator('[aria-label="switch theme to light"]').click();
		await expect(locator).not.toHaveClass('dark');
	});

	test('menu button opens sidebar and sidebar close button closes sidebar', async ({ page }) => {
		await page.locator('button:visible[aria-label="open sidebar"]').click();
		const locator = page.locator('.main > .sidebar');
		await expect(locator).toHaveCSS('margin-left', '0px');

		await page.locator('.sidebar button[aria-label="close sidebar"]').click();
		await expect(locator).toHaveCSS('margin-left', '-256px');
	});

	test('clicking on overlay closes sidebar', async ({ page }) => {
		await page.locator('button:visible[aria-label="open sidebar"]').click();
		const locator = page.locator('.main > .sidebar');
		await expect(locator).toHaveCSS('margin-left', '0px');

		await page.locator('button.overlay[aria-label="close sidebar"]').click();
		await expect(locator).toHaveCSS('margin-left', '-256px');
	});

	test('pressing tab after opening sidebar focuses sidebar close button', async ({ page }) => {
		await page.locator('button:visible[aria-label="open sidebar"]').click();
		await page.keyboard.press('Tab');
		const locator = page.locator('.sidebar button[aria-label="close sidebar"]');
		await expect(locator).toBeFocused();
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
});
