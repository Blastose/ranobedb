import { expect, test } from '@playwright/test';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB } from '$lib/server/db/dbTypes';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.testing' });

const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
		}),
	}),
});

let imageId: number;

test.describe('nsfw images', () => {
	test.beforeAll(async () => {
		const result = await db
			.insertInto('image')
			.values({
				filename: 'test-cover.jpg',
				width: 200,
				height: 300,
				nsfw: false,
				spoiler: false,
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		imageId = result.id;
	});

	test.describe('mod can toggle nsfw image', () => {
		test.use({ storageState: 'storage-state/storageStateMod.json' });

		test('mod can check nsfw and reveal overlay works', async ({ page }) => {
			await page.goto(`/image/${imageId}`);
			await expect(page.getByRole('heading', { name: 'Content settings' })).toBeVisible();

			const checkbox = page.getByLabel('NSFW');
			await expect(checkbox).not.toBeChecked();
			await checkbox.check();
			await page.getByRole('button', { name: 'Apply content settings' }).click();
			await expect(page.locator('.toast-container')).toHaveText('Image updated!');

			await page.reload();
			await expect(checkbox).toBeChecked();

			await expect(page.getByText('Click to reveal')).toBeVisible();
			await page.getByText('Click to reveal').click();
			await expect(page.getByText('Click to reveal')).not.toBeVisible();
			await expect(page.getByRole('button', { name: 'Blur' })).toBeVisible();
			await page.getByRole('button', { name: 'Blur' }).click();
			await expect(page.getByText('Click to reveal')).toBeVisible();
		});

		test('mod can uncheck nsfw image', async ({ page }) => {
			await page.goto(`/image/${imageId}`);

			const checkbox = page.getByLabel('NSFW');
			await expect(checkbox).toBeChecked();
			await checkbox.uncheck();
			await page.getByRole('button', { name: 'Apply content settings' }).click();
			await expect(page.locator('.toast-container')).toHaveText('Image updated!');

			await page.reload();
			await expect(checkbox).not.toBeChecked();
			await expect(page.getByText('Click to reveal')).not.toBeVisible();
		});

		test.afterAll(async () => {
			await db.updateTable('image').set({ nsfw: false }).where('id', '=', imageId).execute();
		});
	});

	test.describe('user cannot edit image', () => {
		test.use({ storageState: 'storage-state/storageStateUser.json' });

		test('user sees read-only view', async ({ page }) => {
			await page.goto(`/image/${imageId}`);
			await expect(page.getByRole('heading', { name: 'Content warnings' })).toBeVisible();
			await expect(page.getByText('NSFW No')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Apply content settings' })).not.toBeVisible();
		});
	});

	test.afterAll(async () => {
		await db.deleteFrom('image').where('id', '=', imageId).execute();
	});
});
