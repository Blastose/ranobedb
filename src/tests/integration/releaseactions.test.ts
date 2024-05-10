import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBReleaseActions } from '$lib/server/db/releases/actions';
import { DBReleases } from '$lib/server/db/releases/releases';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

describe('release actions', () => {
	it('should edit the release', async () => {
		const dbReleaseActions = DBReleaseActions.fromDB(db);
		const release = await db.selectFrom('release').select('id').executeTakeFirstOrThrow();

		const book = await db.selectFrom('book').selectAll().executeTakeFirstOrThrow();
		const publisher = await db.selectFrom('publisher').selectAll().executeTakeFirstOrThrow();
		await dbReleaseActions.editRelease(
			{
				release: {
					comment: 'Test',
					hidden: false,
					locked: false,
					books: [
						{
							id: book.id,
							rtype: 'complete',
						},
					],
					format: 'print',
					lang: 'ja',
					publishers: [
						{
							id: publisher.id,
							name: publisher.name,
							publisher_type: 'publisher',
						},
					],
					release_date: 99999999,
					title: '',
				},
				id: release.id,
			},
			ranobeBot,
		);
		const dbReleases = DBReleases.fromDB(db);
		const changedRelease = await dbReleases.getRelease(release.id).executeTakeFirstOrThrow();
		expect(changedRelease.books.length).toBe(1);
		expect(changedRelease.publishers.length).toBe(1);

		const changedReleaseHist = await dbReleases
			.getReleaseHist({ id: release.id })
			.executeTakeFirstOrThrow();
		expect(changedReleaseHist.books.length).toBe(1);
		expect(changedReleaseHist.publishers.length).toBe(1);
	});

	it('should add a release', async () => {
		const dbReleaseActions = DBReleaseActions.fromDB(db);
		const addedReleaseId = await dbReleaseActions.addRelease(
			{
				release: {
					comment: 'Test',
					hidden: false,
					locked: false,
					books: [],
					format: 'print',
					lang: 'ja',
					publishers: [],
					release_date: 99999999,
					title: '',
				},
			},
			ranobeBot,
		);
		const dbReleases = DBReleases.fromDB(db);
		const addedRelease = await dbReleases.getRelease(addedReleaseId).executeTakeFirstOrThrow();
		expect(addedRelease.books.length).toBe(0);

		const addedReleaseHist = await dbReleases
			.getReleaseHist({ id: addedReleaseId })
			.executeTakeFirstOrThrow();
		expect(addedReleaseHist.books.length).toBe(0);
	});
});
