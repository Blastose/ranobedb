import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/server/db/dbTypes';
import { DBUsers } from '$lib/server/db/user/user';
import { generateUserId } from '$lib/server/lucia/lucia';

dotenv.config({ path: '.env.testing' });

const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
		}),
	}),
});

test.describe('settings', () => {
	test.beforeAll(async () => {
		const dbUsers = new DBUsers(db);
		await dbUsers.createUser({
			email: 'mynotreal@email.com',
			id: generateUserId(15),
			password: 'password',
			username: 'UsernameHere',
		});
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('username or email').fill('mynotreal@email.com');
		await page.getByLabel('Password', { exact: true }).fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');
	});

	test('user can change their username', async ({ page }) => {
		await page.goto('/settings');
		await page.getByLabel('New username').fill('MyCoolUsername');
		await page.getByLabel('Current password').first().fill('password');
		await page.getByRole('button', { name: 'Update username' }).click();
		await expect(page.locator('.toast-container')).toHaveText('Updated username!');
		await expect(page.getByRole('heading', { name: 'MyCoolUsername' })).toBeVisible();
	});

	test('user can change their password', async ({ page }) => {
		await page.goto('/settings');
		await page.getByLabel('Current password').nth(1).fill('password');
		await page.getByLabel('New password').first().fill('my new password');
		await page.getByRole('button', { name: 'Update password' }).click();
		await expect(page.locator('.toast-container')).toHaveText('Updated password!');

		await page.getByRole('button', { name: 'Sign Out' }).click();
		await expect(page).toHaveURL('/login');

		await page.goto('/login');
		await page.getByLabel('username or email').fill('UsernameHere');
		await page.getByLabel('Password', { exact: true }).fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.getByText('Invalid login credentials')).toBeVisible();
	});
});
