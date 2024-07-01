import { expect, test } from '@playwright/test';

test.describe('redirect', () => {
	test('user is redirected to login when trying to access protected route', async ({ page }) => {
		await page.goto('/release/2/edit');
		await expect(page).toHaveURL('/login?redirect=/release/2/edit');

		await page.goto('/book/1/edit');
		await expect(page).toHaveURL('/login?redirect=/book/1/edit');
	});
});

test.describe('user is redirected after logging in', () => {
	test('user is redirected to page after logging in with a redirect search param', async ({
		page,
	}) => {
		await page.goto('/login?redirect=/book/1');
		await page.getByLabel('Username or email').fill('a@a.ca');
		await page.getByLabel('Password').fill('aaaaaa');
		await page.getByRole('button', { name: 'Log in' }).click();

		await expect(page).toHaveURL('/book/1');
	});
});
