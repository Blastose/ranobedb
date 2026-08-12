import { expect, test, type Page } from '@playwright/test';
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

const PASSWORD = 'password';
const PRIVATE_EMAIL = 'privacy@email.com';
const VIEWER_EMAIL = 'viewer@email.com';

let privacyUserId: string = '';
let privacyUserIdNumeric: number = 0;
let viewerUserId: string = '';

async function setPrivate(userId: string, value: boolean) {
	await db.updateTable('auth_user').set({ private: value }).where('id', '=', userId).execute();
}

async function login(page: Page, email: string) {
	await page.goto('/login');
	await page.getByLabel('username or email').fill(email);
	await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
	await page.getByRole('button', { name: 'Log In' }).click();
	await expect(page).toHaveURL('/');
}

const PRIVATE_MESSAGE = "This user's profile is private.";

test.describe('profile privacy', () => {
	test.beforeAll(async () => {
		const dbUsers = new DBUsers(db);
		const privacyUser = await dbUsers.createUser({
			email: PRIVATE_EMAIL,
			id: generateUserId(15),
			password: PASSWORD,
			username: 'privacyuser',
		});
		const viewerUser = await dbUsers.createUser({
			email: VIEWER_EMAIL,
			id: generateUserId(15),
			password: PASSWORD,
			username: 'vieweruser',
		});
		privacyUserId = privacyUser.id;
		privacyUserIdNumeric = privacyUser.id_numeric;
		viewerUserId = viewerUser.id;
	});

	test('user can make their profile private from settings', async ({ page }) => {
		await setPrivate(privacyUserId, false);
		await login(page, PRIVATE_EMAIL);

		await page.goto('/settings?view=privacy');
		await page.getByLabel('Make my profile private').check();
		await page.getByRole('button', { name: 'Save privacy settings' }).click();
		await expect(page.locator('.toast-container')).toHaveText(
			'Updated privacy settings successfully!',
		);

		const res = await db
			.selectFrom('auth_user')
			.where('auth_user.id', '=', privacyUserId)
			.select('auth_user.private')
			.executeTakeFirstOrThrow();
		expect(res.private).toBe(true);
	});

	test('user can make their profile public from settings', async ({ page }) => {
		await setPrivate(privacyUserId, true);
		await login(page, PRIVATE_EMAIL);

		await page.goto('/settings?view=privacy');
		await page.getByLabel('Make my profile private').uncheck();
		await page.getByRole('button', { name: 'Save privacy settings' }).click();
		await expect(page.locator('.toast-container')).toHaveText(
			'Updated privacy settings successfully!',
		);

		const res = await db
			.selectFrom('auth_user')
			.where('auth_user.id', '=', privacyUserId)
			.select('auth_user.private')
			.executeTakeFirstOrThrow();
		expect(res.private).toBe(false);
	});

	test('private profile is hidden from logged out visitors', async ({ page }) => {
		await setPrivate(privacyUserId, true);
		await page.goto(`/user/${privacyUserIdNumeric}`);
		await expect(page.getByText(PRIVATE_MESSAGE)).toBeVisible();

		await page.goto(`/user/${privacyUserIdNumeric}/list/books`);
		await expect(page.getByText(PRIVATE_MESSAGE)).toBeVisible();

		await page.goto(`/user/${privacyUserIdNumeric}/reading-log`);
		await expect(page.getByText(PRIVATE_MESSAGE)).toBeVisible();

		await page.goto(`/user/${privacyUserIdNumeric}/list`);
		await expect(page).toHaveURL(`/user/${privacyUserIdNumeric}`);
		await expect(page.getByText(PRIVATE_MESSAGE)).toBeVisible();
	});

	test('private profile is hidden from other logged in users', async ({ page }) => {
		await setPrivate(privacyUserId, true);
		await login(page, VIEWER_EMAIL);

		await page.goto(`/user/${privacyUserIdNumeric}`);
		await expect(page.getByText(PRIVATE_MESSAGE)).toBeVisible();
	});

	test('user can view their own private profile', async ({ page }) => {
		await setPrivate(privacyUserId, true);
		await login(page, PRIVATE_EMAIL);

		await page.goto(`/user/${privacyUserIdNumeric}`);
		await expect(page.getByText(PRIVATE_MESSAGE)).not.toBeVisible();
		await expect(page.getByText('Joined', { exact: true })).toBeVisible();
	});

	test('edit history stays public when profile is private', async ({ page }) => {
		await setPrivate(privacyUserId, true);

		await page.goto(`/user/${privacyUserIdNumeric}/history`);
		await expect(page.getByText(PRIVATE_MESSAGE)).not.toBeVisible();
		await expect(page.getByRole('heading', { name: 'Edit history of privacyuser' })).toBeVisible();
	});

	test('reviews stay public when profile is private', async ({ page }) => {
		await setPrivate(privacyUserId, true);

		await page.goto(`/user/${privacyUserIdNumeric}/reviews/books`);
		await expect(page.getByText(PRIVATE_MESSAGE)).not.toBeVisible();
		await expect(page.getByRole('heading', { name: `privacyuser's book reviews` })).toBeVisible();
	});

	test('edit history link is shown on private profile when user has changes', async ({ page }) => {
		await setPrivate(privacyUserId, true);

		await db
			.deleteFrom('change')
			.where('change.user_id', '=', privacyUserId)
			.where('change.revision', '=', 999999)
			.execute();
		await db
			.insertInto('change')
			.values({
				comments: '',
				ihid: false,
				ilock: false,
				item_id: 1,
				item_name: 'book',
				revision: 999999,
				user_id: privacyUserId,
			})
			.execute();

		try {
			await page.goto(`/user/${privacyUserIdNumeric}`);
			await expect(page.getByText(PRIVATE_MESSAGE)).toBeVisible();
			await expect(page.getByRole('link', { name: 'Edit history' })).toBeVisible();
		} finally {
			await db
				.deleteFrom('change')
				.where('change.user_id', '=', privacyUserId)
				.where('change.revision', '=', 999999)
				.execute();
		}
	});
});
