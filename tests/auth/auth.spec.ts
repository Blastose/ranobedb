import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/server/db/dbTypes';

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
		const userId = 'aaaaaaaaaaaaaaa';
		const user = await db
			.insertInto('auth_user')
			.values({
				username: 'username',
				id: userId
			})
			.returning('id')
			.executeTakeFirstOrThrow();

		await db
			.insertInto('auth_key')
			.values({
				id: 'email:fake@email.com',
				user_id: user.id,
				hashed_password:
					'Sy7AupawzmlZTlnB:4a2ffaf661cc8d9e4df423b19add3c84c241bffa23e9d7162fc4d6959248dc15b16f0aee40304481a137c031c2147a727fb8d8f5d380743bc7ffc0df9d201fdc'
			})
			.executeTakeFirst();
		id = user.id;
	});
	test.afterAll(async () => {
		await db
			.deleteFrom('user_list_label')
			.where((eb) =>
				eb('id', '=', -1).or(
					'user_list_label.user_id',
					'in',
					eb
						.selectFrom('auth_user')
						.select('auth_user.id')
						.where('auth_user.username', '=', 'usernameDelAfter')
				)
			)
			.execute();
		await db.deleteFrom('auth_session').where('user_id', '=', id).execute();
		await db
			.deleteFrom('auth_session')
			.where((eb) =>
				eb('id', '=', 'none').or(
					'auth_session.user_id',
					'in',
					eb
						.selectFrom('auth_user')
						.select('auth_user.id')
						.where('auth_user.username', '=', 'usernameDelAfter')
				)
			)
			.execute();
		await db.deleteFrom('auth_key').where('id', '=', 'email:fake@email.com').execute();
		await db.deleteFrom('auth_key').where('id', '=', 'email:email@DelAfter.com').execute();
		await db.deleteFrom('auth_user').where('username', '=', 'username').execute();
		await db.deleteFrom('auth_user').where('username', '=', 'usernameDelAfter').execute();
	});

	test('user can login and logout', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('email').fill('fake@email.com');
		await page.getByLabel('password').fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/');

		await page.getByRole('button', { name: 'Sign Out' }).click();
		await expect(page).toHaveURL('/login');
	});

	test('user can create an account', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('email@DelAfter.com');
		await page.getByLabel('username').fill('usernameDelAfter');
		await page.getByLabel('password').fill('passwordDelAfter');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page).toHaveURL('/');
	});

	test('user cannot login with invalid credentials', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('email').fill('fake@fake.ca');
		await page.getByLabel('password').fill('password');
		await page.getByRole('button', { name: 'Log In' }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.getByText('Invalid login credentials')).toBeVisible();
	});

	test('user cannot create an account with invalid password', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('email@email.com');
		await page.getByLabel('username').fill('username');
		await page.getByLabel('password').fill('1');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page).toHaveURL('/signup');
	});

	test('user cannot create an account with same email', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('fake@email.com');
		await page.getByLabel('username').fill('username123');
		await page.getByLabel('password').fill('aejdjsldjlsee');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(
			page.getByText('Email is already in use. Please use a different email')
		).toBeVisible();
	});

	test('user cannot create an account with same username', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('email').fill('not@email.com');
		await page.getByLabel('username').fill('username');
		await page.getByLabel('password').fill('aejdjsldjlsee');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(
			page.getByText('Username is already in use. Please use a different username')
		).toBeVisible();
	});
});
