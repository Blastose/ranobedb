import { expect, test } from '@playwright/test';

test.describe('pagination', () => {
	test('user can navigate using pagination links', async ({ page }) => {
		await page.goto('/books');

		await page.locator('a.arrow-button[aria-label="Next"]').first().click();
		await expect(page).toHaveURL('/books?page=2');

		await page.locator('a.arrow-button[aria-label="Previous"]').first().click();
		await expect(page).toHaveURL('/books?page=1');

		await page.locator('a.pagination-button[href="/books?page=3"]').first().click();
		await expect(page).toHaveURL('/books?page=3');

		await page.goto('/books?page=1231323');
		const paginationButtons = await page.locator('a.pagination-button').all();
		expect(paginationButtons.length).toBe(0);
	});
});
