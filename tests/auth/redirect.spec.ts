import { expect, test } from '@playwright/test';

test.describe('redirect', () => {
	test('user is redirected to login when trying to access protected route', async ({ page }) => {
		await page.goto('/profile');
		await expect(page).toHaveURL('/login?redirect=/profile');

		await page.goto('/my-list');
		await expect(page).toHaveURL('/login?redirect=/my-list');

		await page.goto('/book/1031');
		await page.locator('main a.add-button').click();
		await expect(page).toHaveURL('/login?redirect=/book/1031');
	});
});

test.describe('user is redirected after logging in', () => {
	test.afterEach(async ({ page }) => {
		await page.locator('form[action="/signout"] > button[type="submit"]').click();
		await expect(page).toHaveURL('/login');
	});

	test('user is redirected to page after logging in with a redirect search param', async ({
		page
	}) => {
		await page.goto('/login?redirect=/book/1031');
		await page.getByLabel('email').fill('aa@aa.com');
		await page.getByLabel('password').fill('aaaaaa');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/book/1031');
	});
});
