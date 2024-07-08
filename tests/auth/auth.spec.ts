import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/server/db/dbTypes';
import { DBUsers } from '$lib/server/db/user/user';
import { generateId } from 'lucia';

dotenv.config({ path: '.env.testing' });

const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
		}),
	}),
});

test.describe('auth', () => {
	test.beforeAll(async () => {
		const dbUsers = new DBUsers(db);
		await dbUsers.createUser({
			email: 'fake@email.com',
			id: generateId(15),
			password: 'password',
			username: 'username',
		});
	});

	test('user can login and logout', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('username or email').fill('fake@email.com');
		await page.getByLabel('Password', { exact: true }).fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/');

		await page.getByRole('button', { name: 'Sign Out' }).click();
		await expect(page).toHaveURL('/login');
	});

	test('user can login with username', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('username or email').fill('username');
		await page.getByLabel('Password', { exact: true }).fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/');
	});

	test('user can create an account', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill(`${generateId(15)}@a.com`);
		await page.getByLabel('username').fill(generateId(15));
		const password = generateId(15);
		await page.getByLabel('Password (15+ characters)').fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page).toHaveURL('/welcome');
	});

	test('user cannot login with invalid credentials', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('username or email').fill(generateId(15));
		await page.getByLabel('Password', { exact: true }).fill(generateId(15));
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.getByText('Invalid login credentials')).toBeVisible();
	});

	test('user cannot create an account without confirming they read the terms', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill(`${generateId(15)}@a.com`);
		await page.getByLabel('username').fill(generateId(15));
		const password = generateId(15);
		await page.getByLabel('Password (15+ characters)').fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page).toHaveURL('/signup');
	});

	test('user cannot create an account without confirming their password', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill(`${generateId(15)}@a.com`);
		await page.getByLabel('username').fill(generateId(15));
		await page.getByLabel('Password (15+ characters)').fill(generateId(15));
		await page.getByLabel('Confirm password').fill(generateId(15));
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page).toHaveURL('/signup');
	});

	test('user cannot create an account with invalid password', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill(`${generateId(15)}@a.com`);
		await page.getByLabel('username').fill(generateId(15));
		await page.getByLabel('Password (15+ characters)').fill('1');
		await page.getByLabel('Confirm password').fill('1');
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page).toHaveURL('/signup');
	});

	test('user cannot create an account with same email', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('fake@email.com');
		await page.getByLabel('username').fill(generateId(15));
		const password = generateId(15);
		await page.getByLabel('Password (15+ characters)').fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(
			page.getByText('Email is already in use. Please use a different email'),
		).toBeVisible();
	});

	test('user cannot create an account with same username', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill(`${generateId(15)}@email.com`);
		await page.getByLabel('username').fill('username');
		const password = generateId(15);
		await page.getByLabel('Password (15+ characters)').fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(
			page.getByText('Username is already in use. Please use a different username'),
		).toBeVisible();
	});

	test('user cannot create an account with same username but in different case', async ({
		page,
	}) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill(`${generateId(15)}@email.com`);
		await page.getByLabel('username').fill('UsErNaMe');
		const password = generateId(15);
		await page.getByLabel('Password (15+ characters)').fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page
			.getByLabel('I have read and agree with the privacy policy and terms of use.')
			.check();
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(
			page.getByText('Username is already in use. Please use a different username'),
		).toBeVisible();
	});

	test('User cannot access login required pages', async ({ page }) => {
		await page.goto('/books/add');
		await expect(page).toHaveURL('/login?redirect=/books/add');
	});
});
