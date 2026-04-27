import { expect, test } from '@playwright/test';

test.describe('account deletion', () => {
	test('User can delete their account', async ({ page }) => {
		//  Login
		await page.goto('/login');
		await page.getByLabel('username or email').fill('dummy@example.com');
		await page.getByLabel('Password', { exact: true }).fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');

		// Delete account
		await page.goto('/settings');
		await page
			.locator('section')
			.filter({ hasText: 'Danger zone Delete account' })
			.getByPlaceholder('Password')
			.fill('password');
		await page.getByRole('textbox', { name: 'To confirm account deletion,' }).fill('asdf');
		await page.getByRole('button', { name: 'Delete account' }).click();
		expect(page.getByText('Confirmation phrase must')).toBeVisible();
		await page
			.getByRole('textbox', { name: 'To confirm account deletion,' })
			.fill('delete my account');
		await page.getByRole('button', { name: 'Delete account' }).click();
		expect(page.getByText('Confirmation phrase must')).toBeVisible();
		await page
			.getByRole('textbox', { name: 'To confirm account deletion,' })
			.fill('Delete my account');
		await page.getByRole('button', { name: 'Delete account' }).click();
		expect(page.getByRole('heading', { name: 'Successfully deleted account!' })).toBeVisible();
		await expect(page).toHaveURL('/deleted-account');

		// Try login again (should fail)
		await page.goto('/login');
		await page.getByLabel('username or email').fill('dummy@example.com');
		await page.getByLabel('Password', { exact: true }).fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/login');
	});
});
