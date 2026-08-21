import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;
import type { DB, DbItem } from '$lib/server/db/dbTypes';
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

const randomId = Math.random().toString(36).slice(2, 10);
const PAT_TOKEN = `pat_${randomId}`;

let patUserId: string;
let itemIds = {
	book: 1,
	series: 1,
	publisher: 1,
	staff: 1,
	release: 1,
};

function getItems() {
	return [
		// Order matters here for series -> book -> release for the action return type (add or edit) since adding a release will also add a book and series
		{
			name: 'series',
			notInList: 'Series is not in the list',
			putBody: {
				seriesId: itemIds.series,
				readingStatus: 'Reading',
				selectedCustLabels: [],
				langs: ['en'],
				formats: [],
				show_upcoming: true,
				notify_book: true,
				notify_when_released: false,
			},
		},
		{
			name: 'book',
			notInList: 'Book is not in the list',
			putBody: { bookId: itemIds.book, readingStatus: 'Reading', selectedCustLabels: [] },
		},
		{
			name: 'release',
			notInList: 'This release is not in the list',
			putBody: { release_status: 'owned' },
		},
		{
			name: 'staff',
			notInList: 'Staff is not in the list',
			putBody: {
				notify_book: true,
				show_upcoming: true,
				only_first_book: true,
				langs: ['en'],
				formats: [],
			},
		},
		{
			name: 'publisher',
			notInList: 'Publisher is not favorited',
			putBody: undefined,
		},
	] as const;
}

const JSON_HEADER = { 'Content-Type': 'application/json' };
function authHeaders(token?: string): Record<string, string> {
	return { ...JSON_HEADER, Authorization: `Bearer ${token}` };
}

test.beforeAll(async () => {
	const dbUsers = new DBUsers(db);
	patUserId = (
		await dbUsers.createUser({
			email: `pat-${randomId}@test.com`,
			id: generateUserId(15),
			password: 'PASSWORD',
			username: `patuser-${randomId}`,
		})
	).id;

	await db
		.insertInto('auth_user_personal_access_token')
		.values({ user_id: patUserId, personal_access_token: PAT_TOKEN, regenerated_at: new Date() })
		.execute();
});

test.describe('PAT auth + v0 user list API', () => {
	test('GET /me without auth returns 401', async ({ request }) => {
		const res = await request.get('/api/v0/user/me', { headers: JSON_HEADER });
		expect(res.status()).toBe(401);
	});

	test('PUT without auth returns 401', async ({ request }) => {
		const res = await request.put(`/api/v0/user/book/${itemIds.book}`, {
			headers: JSON_HEADER,
			data: getItems()[0].putBody,
		});
		expect(res.status()).toBe(401);
	});

	test('malformed Authorization header returns 400', async ({ request }) => {
		const url = `/api/v0/user/book/${itemIds.book}`;
		const empty = await request.put(url, {
			headers: { ...JSON_HEADER, Authorization: 'Bearer ' },
			data: getItems()[0].putBody,
		});
		expect(empty.status()).toBe(400);
		const basic = await request.put(url, {
			headers: { ...JSON_HEADER, Authorization: 'Basic abc' },
			data: getItems()[0].putBody,
		});
		expect(basic.status()).toBe(400);
	});

	test('invalid PAT returns 401', async ({ request }) => {
		const res = await request.put(`/api/v0/user/book/${itemIds.book}`, {
			headers: authHeaders('wrong_token_xyz'),
			data: getItems()[0].putBody,
		});
		expect(res.status()).toBe(401);
	});

	test('valid PAT GET /me returns the PAT user', async ({ request }) => {
		const res = await request.get('/api/v0/user/me', { headers: authHeaders(PAT_TOKEN) });
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.id).toBe(patUserId);
	});

	test('valid PAT add/edit/delete for all items', async ({ request }) => {
		for (const item of getItems()) {
			const url = `/api/v0/user/${item.name}/${itemIds[item.name]}`;
			const addRes = await request.put(url, {
				headers: authHeaders(PAT_TOKEN),
				data: item.putBody,
			});
			expect(addRes.status()).toBe(200);
			const addBody = await addRes.json();
			if (item.name !== 'publisher') {
				expect(addBody.action).toBe('add');
			}

			const editRes = await request.put(url, {
				headers: authHeaders(PAT_TOKEN),
				data: item.putBody,
			});
			expect(editRes.status()).toBe(200);
			const editBody = await editRes.json();
			if (item.name !== 'publisher') {
				expect(editBody.action).toBe('edit');
			}

			const delRes = await request.delete(url, { headers: authHeaders(PAT_TOKEN) });
			expect(delRes.status()).toBe(200);

			const delAgain = await request.delete(url, { headers: authHeaders(PAT_TOKEN) });
			expect(delAgain.status()).toBe(400);
			expect(await delAgain.text()).toContain(item.notInList);
		}
	});

	// Errors
	test('PUT with nonexistent id returns 400', async ({ request }) => {
		for (const item of getItems()) {
			const res = await request.put(`/api/v0/user/${item.name}/999999999`, {
				headers: authHeaders(PAT_TOKEN),
				data: item.putBody,
			});
			expect(res.status()).toBe(400);
			expect(await res.text()).toContain('does not exist');
		}
	});

	test('PUT with invalid body returns 400', async ({ request }) => {
		const res = await request.put(`/api/v0/user/book/${itemIds.book}`, {
			headers: authHeaders(PAT_TOKEN),
			data: {},
		});
		expect(res.status()).toBe(400);
	});
});
