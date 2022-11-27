import { expect, test } from '@playwright/test';

test.describe('auth', () => {
	test('user can login', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('').fill('username');
		await page.getByLabel('').fill('password');
		await page.getByLabel('').click();

		await expect(page).toHaveURL('fakeurl');
	});

	test('user can logout', async ({ page }) => {
		await page.goto('/login');
		await expect(page).toHaveURL('fakeurl');
	});

	test('user can create an account', async ({ page }) => {
		await page.goto('/signup');
		await expect(page).toHaveURL('fakeurl');
	});

	test('user cannot create account with same username', async ({ page }) => {
		await expect(page).toHaveURL('fakeurl');
	});
	test('user cannot login with invalid credentials', async ({ page }) => {
		await expect(page).toHaveURL('fakeurl');
	});
});
