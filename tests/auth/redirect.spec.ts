import { expect, test } from '@playwright/test';

// TODO
test.describe.skip('redirect', () => {
	test('user is redirected to login when trying to access protected route', async ({ page }) => {
		await page.goto('/profile');
		await expect(page).toHaveURL('/login?redirect=/profile');

		await page.goto('/my-list');
		await expect(page).toHaveURL('/login?redirect=/my-list');

		await page.goto('/book/1031');
		await page.locator('main').getByRole('link', { name: 'Add' }).click();
		await expect(page).toHaveURL('/login?redirect=/book/1031');
	});
});

test.describe.skip('user is redirected after logging in', () => {
	test.afterEach(async ({ page }) => {
		await page.getByRole('button', { name: 'Sign Out' }).click();
		await expect(page).toHaveURL('/login');
	});

	test('user is redirected to page after logging in with a redirect search param', async ({
		page,
	}) => {
		await page.goto('/login?redirect=/book/1031');
		await page.getByLabel('email').fill('aa@aa.com');
		await page.getByLabel('password').fill('aaaaaa');
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/book/1031');
	});
});
