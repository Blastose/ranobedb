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

test.describe('auth', () => {
	test('user can verify their email right after they sign up', async ({ page }) => {
		await page.goto('/signup');
		const email = `${generateUserId(15)}@a.com`;
		await page.getByLabel('email').fill(email);
		await page.getByLabel('username').fill(generateUserId(15));
		const password = generateUserId(15);
		await page.getByLabel('Password (15+ characters)').fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page).toHaveURL('/welcome');
		await page.goto('/settings?view=email');
		await page.getByLabel('Code').first().fill('12345678');
		await page.getByRole('button', { name: 'Verify' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Invalid code!');

		await page.getByLabel('Code').first().fill('99999999');
		await page.getByRole('button', { name: 'Verify' }).click();

		await expect(page.getByText('Your email is verified')).toBeVisible();
	});

	test('user can verify their email with verification code', async ({ page }) => {
		const dbUsers = new DBUsers(db);
		const createdUser1 = await dbUsers.createUser({
			email: 'aaaa+4231@aaaa.ca',
			id: 'asdfedsefedesfe',
			password: 'passwordpassword',
			username: 'jimmystevebob',
		});

		await page.goto('/login');
		await page.getByLabel('username or email').fill(createdUser1.username);
		await page.getByLabel('Password', { exact: true }).fill('passwordpassword');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');

		await page.goto('/settings?view=email');
		await page.getByLabel('Current password').first().fill('passwordpassword');
		await page.getByRole('button', { name: 'Send verification code' }).click();

		await expect(page.locator('.toast-container').last()).toHaveText(
			'Sent a verification code to your email address!',
		);

		await page.getByLabel('Code').first().fill('12345678');
		await page.getByRole('button', { name: 'Verify' }).click();
		await expect(page.locator('.toast-container').last()).toHaveText('Invalid code!');

		await page.getByLabel('Code').first().fill('99999999');
		await page.getByRole('button', { name: 'Verify' }).click();

		await expect(page.getByText('Your email is verified')).toBeVisible();
	});

	test('user can change their email', async ({ page }) => {
		const dbUsers = new DBUsers(db);
		const createdUser3 = await dbUsers.createUser({
			email: 'aaaa+31234@aaaa.ca',
			id: 'ikdjekdlsnekdje',
			password: 'passwordpassword',
			username: 'qwertyuiop',
		});

		await page.goto('/login');
		await page.getByLabel('username or email').fill(createdUser3.username);
		await page.getByLabel('Password', { exact: true }).fill('passwordpassword');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');

		await page.goto('/settings?view=email');
		await page.getByLabel('Current email').fill('aaaa+31234@aaaa.ca');
		await page.getByLabel('New email').fill('new_aaaa+31234@aaaa.ca');
		await page.getByLabel('Current password').last().fill('passwordpassword');
		await page.getByRole('button', { name: 'Change email' }).click();

		await expect(page.locator('.toast-container').last()).toHaveText(
			'Sent an email to new email address!',
		);

		await page.goto('/email-verification?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
		await expect(
			page.getByText('Your email has successfully changed and is now verified.'),
		).toBeVisible();
		await page.getByRole('button', { name: 'Sign Out' }).click();
		await expect(page).toHaveURL('/login');

		await page.goto('/login');
		await page.getByLabel('username or email').fill('aaaa+31234@aaaa.ca');
		await page.getByLabel('Password', { exact: true }).fill('passwordpassword');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/login');

		await page.goto('/login');
		await page.getByLabel('username or email').fill('new_aaaa+31234@aaaa.ca');
		await page.getByLabel('Password', { exact: true }).fill('passwordpassword');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');

		const email_verified = await db
			.selectFrom('auth_user_credentials')
			.selectAll()
			.where('auth_user_credentials.user_id', '=', createdUser3.id)
			.executeTakeFirstOrThrow();
		expect(email_verified.email_verified).toBe(true);
	});

	test('user can reset their password', async ({ page }) => {
		const dbUsers = new DBUsers(db);
		const createdUser2 = await dbUsers.createUser({
			email: 'aaaa+12432@aaaa.ca',
			id: 'aljeibndkfjekdj',
			password: 'passwordpassword',
			username: 'alicemaryjane',
		});
		await db
			.updateTable('auth_user_credentials')
			.set({ email_verified: true })
			.where('auth_user_credentials.user_id', '=', createdUser2.id)
			.execute();

		await page.goto('/forgot-password');
		await page.getByLabel('email').fill('aaaa+12432@aaaa.ca');
		await page.getByRole('button', { name: 'Reset password' }).click();

		await expect(page).toHaveURL('/forgot-password/check-email');
		await expect(page.getByText('Check your email')).toBeVisible();

		await page.goto('/reset-password?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
		await expect(page.getByText('Reset your password')).toBeVisible();

		await page.getByLabel('Password (15+ characters)').fill('passwordpassword');
		await page.getByLabel('Confirm password').fill('mycoolnewpassword');

		await page.getByRole('button', { name: 'Reset password' }).click();

		await expect(page.locator('.toast-container').last()).toHaveText('Error in form!');

		await page.getByLabel('Password (15+ characters)').fill('mycoolnewpassword');
		await page.getByLabel('Confirm password').fill('mycoolnewpassword');

		await page.getByRole('button', { name: 'Reset password' }).click();

		await expect(page.locator('.toast-container').last()).toHaveText('Updated password!');

		await page.goto('/login');
		await page.getByLabel('username or email').fill('aaaa+12432@aaaa.ca');
		await page.getByLabel('Password', { exact: true }).fill('passwordpassword');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/login');

		await page.goto('/login');
		await page.getByLabel('username or email').fill('aaaa+12432@aaaa.ca');
		await page.getByLabel('Password', { exact: true }).fill('mycoolnewpassword');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');
	});
});
