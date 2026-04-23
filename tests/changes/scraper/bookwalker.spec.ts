import { expect, test } from '@playwright/test';

test.describe('bookwalker scraper mod', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('Mod can use BookWalker scraper', async ({ page }) => {
		await page.goto('/add/from-bookwalker');
		await page
			.getByRole('textbox', { name: 'BookWalker JP URL' })
			.fill('https://bookwalker.jp/de743165eb-ae6b-4dc7-81f3-422c5534b729/');
		await page.getByRole('button', { name: 'Fetch data' }).click();
		await page.getByRole('checkbox', { name: 'Create series' }).check();
		await page.getByRole('checkbox', { name: 'Use image' }).uncheck();
		await page.getByRole('button', { name: 'Add', exact: true }).click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added book!');

		await page.goto('/add/from-bookwalker');
		await page
			.getByRole('textbox', { name: 'BookWalker JP URL' })
			.fill('https://bookwalker.jp/de743165eb-ae6b-4dc7-81f3-422c5534b729/');
		await page.getByRole('button', { name: 'Fetch data' }).click();
		await expect(page.getByText('Error: Book is already in database at')).toBeVisible();
	});

	test('Mod can use BookWalker scraper to add only release', async ({ page }) => {
		await page.goto('/add/from-bookwalker');
		await page
			.getByRole('textbox', { name: 'BookWalker JP URL' })
			.fill('https://bookwalker.jp/dec99d301a-464b-4ae0-a8a8-0f135fa3058a/');
		await page.getByRole('button', { name: 'Fetch data' }).click();
		await page.getByRole('checkbox', { name: 'Create book' }).uncheck();
		await page.getByRole('button', { name: 'Add', exact: true }).click();

		await expect(page.locator('.toast-container')).toHaveText('Successfully added release!');
	});
});

test.describe('bookwalker scraper invalid permissions', () => {
	test.use({ storageState: 'storage-state/storageStateUser.json' });

	test('User cannot use BookWalker scraper due to invalid permissions', async ({
		page,
		request,
	}) => {
		await page.goto('/add/from-bookwalker');
		await expect(page.locator('h1')).toHaveText('Access Denied');

		const response = await request.post('/add/from-bookwalker?add_from_data', {
			data: '',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});
		expect(response.status()).toBe(403);
	});
});
