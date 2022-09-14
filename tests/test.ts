import { expect, test } from '@playwright/test';

test.describe('navigation', () => {
	test('index page has expected span', async ({ page }) => {
		await page.goto('/');
		expect(await page.textContent('main > div > h1')).toBe('Welcome to RanobeDB');
	});

	test('books page has expected span', async ({ page }) => {
		await page.goto('/books');
		expect(await page.textContent('main > div > div > span')).toBe('Books');
	});

	test('book/[id] page has expected span', async ({ page }) => {
		await page.goto('/book/1031');
		expect(await page.textContent('main > div > div > span')).toBe(
			'『ずっと友達でいてね』と言っていた女友達が友達じゃなくなるまで'
		);
	});

	test('series page has expected span', async ({ page }) => {
		await page.goto('/series');
		expect(await page.textContent('main > div > div > span')).toBe('Series');
	});

	test('series/[id] page has expected span', async ({ page }) => {
		await page.goto('/series/1004');
		expect(await page.textContent('main > div > div > span')).toBe(
			'『ずっと友達でいてね』と言っていた女友達が友達じゃなくなるまで'
		);
	});

	test('people page has expected span', async ({ page }) => {
		await page.goto('/people');
		expect(await page.textContent('main > div > span')).toBe('People');
	});

	test('person/[id] page has expected span', async ({ page }) => {
		await page.goto('/person/1');
		expect(await page.textContent('main > div > div > span')).toBe('風見鶏');
	});

	test('publishers page has expected span', async ({ page }) => {
		await page.goto('/publishers');
		expect(await page.textContent('main > div > span')).toBe('Publishers');
	});

	test('publisher/[id] page has expected span', async ({ page }) => {
		await page.goto('/publisher/1');
		expect(await page.textContent('main > div > div > span')).toBe('KADOKAWA');
	});

	test('login page has expected h1', async ({ page }) => {
		await page.goto('/login');
		expect(await page.textContent('main > div > div > h1')).toBe('Log In');
	});

	test('signup page has expected h1', async ({ page }) => {
		await page.goto('/signup');
		expect(await page.textContent('main > div > div > h1')).toBe('Sign up');
	});

	test('my-list page redirects for users not logged in', async ({ page }) => {
		const response = await page.goto('/my-list');
		expect(response?.status() === 301);
	});

	test('unknown page has expected span', async ({ page }) => {
		const response = await page.goto('/asdfasdfj');
		expect(response?.status() === 404);
	});
});
