import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/types/dbTypes';

dotenv.config();

const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL
		})
	})
});

let id: string;
test.describe('auth', () => {
	test.beforeAll(async () => {
		const user = await db
			.insertInto('user')
			.values({
				username: 'username'
			})
			.returning('id')
			.executeTakeFirstOrThrow();

		await db
			.insertInto('key')
			.values({
				id: 'email:fake@email.com',
				primary: true,
				user_id: user.id,
				hashed_password:
					'Sy7AupawzmlZTlnB:4a2ffaf661cc8d9e4df423b19add3c84c241bffa23e9d7162fc4d6959248dc15b16f0aee40304481a137c031c2147a727fb8d8f5d380743bc7ffc0df9d201fdc'
			})
			.executeTakeFirst();
		id = user.id;
	});
	test.afterAll(async () => {
		await db.deleteFrom('session').where('user_id', '=', id).execute();
		await db.deleteFrom('key').where('id', '=', 'email:fake@email.com').execute();
		await db.deleteFrom('key').where('id', '=', 'email:email@DelAfter.com').execute();
		await db.deleteFrom('user').where('username', '=', 'username').execute();
		await db.deleteFrom('user').where('username', '=', 'usernameDelAfter').execute();
	});

	test('user can login and logout', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('email').fill('fake@email.com');
		await page.getByLabel('password').fill('password');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/');
		await page.goto('/my-list');
		await expect(page).toHaveURL('/my-list');

		await page.locator('form[action="/signout"] > button[type="submit"]').click();
		await expect(page).toHaveURL('/login');
	});

	test('user can create an account', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('email@DelAfter.com');
		await page.getByLabel('username').fill('usernameDelAfter');
		await page.getByLabel('password').fill('passwordDelAfter');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/signup');
		const locator = page.locator('main > div > p');
		await expect(locator).toContainText('Successfully created an account.');
	});

	test('user cannot login with invalid credentials', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('email').fill('fake');
		await page.getByLabel('password').fill('password');
		await page.locator('main form button[type="submit"]').click();

		await expect(page).toHaveURL('/login');
	});

	test('user cannot create an account with invalid password', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('email@email.com');
		await page.getByLabel('username').fill('username');
		await page.getByLabel('password').fill('1');
		await page.locator('main form button[type="submit"]').click();

		const locator = page.locator('div > label + input#password + span');
		await expect(locator).toContainText('Password must be between 6 and 255 characters');
	});

	test('user cannot create an account with same email', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('fake@email.com');
		await page.getByLabel('username').fill('username123');
		await page.getByLabel('password').fill('aejdjsldjlsee');
		await page.locator('main form button[type="submit"]').click();

		const locator = page.locator('div > label + input#email + span');
		await expect(locator).toContainText('Email is already in use. Please use a different email');
	});

	test('user cannot create an account with same username', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('not@email.com');
		await page.getByLabel('username').fill('username');
		await page.getByLabel('password').fill('aejdjsldjlsee');
		await page.locator('main form button[type="submit"]').click();

		const locator = page.locator('div > label + input#username + span');
		await expect(locator).toContainText(
			'Username is already in use. Please use a different username'
		);
	});

	test('user cannot access login only pages', async ({ page }) => {
		await page.goto('/my-list');
		await expect(page).not.toHaveURL('/my-list');
	});
});
