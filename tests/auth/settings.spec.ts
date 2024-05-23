import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/db/dbTypes';
import { generateId } from 'lucia';

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
		const userId = generateId(16);
		await db
			.insertInto('auth_user')
			.values({
				username: 'UsernameHere',
				username_lowercase: 'usernamehere',
				id: userId,
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		await db
			.insertInto('auth_user_credentials')
			.values({
				email: 'mynotreal@email.com',
				// Unhashed password is `password`
				hashed_password:
					'$argon2id$v=19$m=19456,t=2,p=1$KXosrnaI50U0xiXDxyoGxA$axycEXkr/fz3OhsPJafCaAaj7I7vM1bBUPfZuRfWzvQ',
				user_id: userId,
			})
			.execute();
	});
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('username or email').fill('mynotreal@email.com');
		await page.getByLabel('password').fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');
	});

	test('user can change their username', async ({ page }) => {
		await page.goto('/settings');
		await page.getByLabel('Username').fill('MyCoolUsername');
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
		await page.getByLabel('password').fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.getByText('Invalid login credentials')).toBeVisible();
	});
});
