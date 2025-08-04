import { expect, test } from '@playwright/test';

test.describe('book reviews', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('User can add, edit, and delete book review', async ({ page }) => {
		await page.goto('/book/1/reviews');
		await page.getByText('Write a review').click();
		await expect(page).toHaveURL('/book/1/reviews/add');
		await page.getByLabel('Score').fill('10');
		await page.getByLabel('This review contains unmarked spoilers').check();
		await page
			.getByLabel('Review', { exact: true })
			.fill(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			);
		await page.locator('main').locator('button[type="submit"]').click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Successfully added a review!',
		);

		await expect(page).toHaveURL('/book/1/reviews');
		await expect(page.getByText('1 results')).toBeVisible();
		await page.getByText('View in full view').click();
		await expect(page).toHaveURL(new RegExp('.*\\/review\\/book\\/\\d+'));
		await expect(page.getByText('Score: 10')).toBeVisible();
		await expect(page.getByText('This review contains spoilers. Click to show.')).toBeVisible();

		await page.getByText('Edit your review').click();
		await page.getByLabel('Score').fill('');
		await page.getByLabel('This review contains unmarked spoilers').uncheck();
		await page.locator('main').locator('button[type="submit"]').click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Successfully edited your review!',
		);

		await expect(page).toHaveURL('/book/1/reviews');
		await page.getByText('View in full view').click();
		await expect(page).toHaveURL(new RegExp('.*\\/review\\/book\\/\\d+'));
		await expect(page.getByText('Score: No score given')).toBeVisible();
		await expect(page.getByText('Lorem ipsum dolor')).toBeVisible();

		await page.getByText('Edit your review').click();
		await page.getByLabel('Score').fill('5.6');
		await page.getByLabel('This review contains unmarked spoilers').uncheck();
		await page.locator('main').locator('button[type="submit"]').click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Successfully edited your review!',
		);

		await expect(page).toHaveURL('/book/1/reviews');
		await page.getByText('View in full view').click();
		await expect(page).toHaveURL(new RegExp('.*\\/review\\/book\\/\\d+'));
		await expect(page.getByText('Score: 5.6')).toBeVisible();
		await expect(page.getByText('Lorem ipsum dolor')).toBeVisible();

		await page.getByText('Edit your review').click();
		await expect(page).toHaveURL('/book/1/reviews/add');
		await page.getByRole('button', { name: 'Delete review' }).click();
		await page.getByRole('button', { name: 'Delete', exact: true }).click();
		await expect(page).toHaveURL('/book/1/reviews');

		await expect(page.locator('.toast-container').last()).toHaveText('Deleted review!');
	});
});

test.describe('series reviews', () => {
	test.use({ storageState: 'storage-state/storageStateMod.json' });

	test('User can add, edit, and delete series review', async ({ page }) => {
		await page.goto('/series/1/reviews');
		await page.getByText('Write a review').click();
		await expect(page).toHaveURL('/series/1/reviews/add');
		await page.getByLabel('Score').fill('10');
		await page.getByLabel('This review contains unmarked spoilers').check();
		await page
			.getByLabel('Review', { exact: true })
			.fill(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			);
		await page.locator('main').locator('button[type="submit"]').click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Successfully added a review!',
		);

		await expect(page).toHaveURL('/series/1/reviews');
		await expect(page.getByText('1 results')).toBeVisible();
		await page.getByText('View in full view').click();
		await expect(page).toHaveURL(new RegExp('.*\\/review\\/series\\/\\d+'));
		await expect(page.getByText('Score: 10')).toBeVisible();
		await expect(page.getByText('This review contains spoilers. Click to show.')).toBeVisible();

		await page.getByText('Edit your review').click();
		await page.getByLabel('Score').fill('');
		await page.getByLabel('This review contains unmarked spoilers').uncheck();
		await page.locator('main').locator('button[type="submit"]').click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Successfully edited your review!',
		);

		await expect(page).toHaveURL('/series/1/reviews');
		await page.getByText('View in full view').click();
		await expect(page).toHaveURL(new RegExp('.*\\/review\\/series\\/\\d+'));
		await expect(page.getByText('Score: No score given')).toBeVisible();
		await expect(page.getByText('Lorem ipsum dolor')).toBeVisible();

		await page.getByText('Edit your review').click();
		await page.getByLabel('Score').fill('4.7');
		await page.getByLabel('This review contains unmarked spoilers').uncheck();
		await page.locator('main').locator('button[type="submit"]').click();
		await expect(page.locator('.toast-container').last()).toHaveText(
			'Successfully edited your review!',
		);

		await expect(page).toHaveURL('/series/1/reviews');
		await page.getByText('View in full view').click();
		await expect(page).toHaveURL(new RegExp('.*\\/review\\/series\\/\\d+'));
		await expect(page.getByText('Score: 4.7')).toBeVisible();
		await expect(page.getByText('Lorem ipsum dolor')).toBeVisible();

		await page.getByText('Edit your review').click();
		await expect(page).toHaveURL('/series/1/reviews/add');
		await page.getByRole('button', { name: 'Delete review' }).click();
		await page.getByRole('button', { name: 'Delete', exact: true }).click();
		await expect(page).toHaveURL('/series/1/reviews');

		await expect(page.locator('.toast-container').last()).toHaveText('Deleted review!');
	});
});
