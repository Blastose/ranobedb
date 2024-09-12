import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBReleaseActions } from '$lib/server/db/releases/actions';
import { DBReleases, type ReleaseEdit } from '$lib/server/db/releases/releases';
import type { MaybePromise } from '@sveltejs/kit';
import { setupReleaseEditObjsForEqualityTest } from '$lib/db/obj';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

async function testReleases(params: {
	id: number;
	cb_publisher: (pub: ReleaseEdit) => MaybePromise<void>;
}) {
	const { id, cb_publisher } = params;
	const dbReleases = DBReleases.fromDB(db);

	const release = await dbReleases.getReleaseEdit(id).executeTakeFirstOrThrow();

	const releaseHist = await dbReleases.getReleaseHistEdit({ id: id }).executeTakeFirstOrThrow();

	await cb_publisher(release);
	await cb_publisher(releaseHist);

	setupReleaseEditObjsForEqualityTest(release, releaseHist);
	expect(release).toStrictEqual(releaseHist);
}

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
					website: 'https://example.com',
				},
				id: release.id,
			},
			ranobeBot,
		);

		await testReleases({
			id: release.id,
			cb_publisher: (r) => {
				expect(r.books.length).toBe(1);
				expect(r.books[0].rtype).toBe('complete');
				expect(r.publishers.length).toBe(1);
				expect(r.publishers[0].publisher_type).toBe('publisher');
			},
		});

		const dbReleases = DBReleases.fromDB(db);
		let changedRelease = await dbReleases.getReleaseEdit(release.id).executeTakeFirstOrThrow();

		await dbReleaseActions.editRelease(
			{
				release: {
					...changedRelease,
					books: [
						{
							id: book.id,
							rtype: 'partial',
						},
					],
					publishers: [
						{
							id: publisher.id,
							name: publisher.name,
							publisher_type: 'imprint',
						},
					],
					website: undefined,
					amazon: undefined,
					bookwalker: undefined,
					comment: 'Edit',
				},
				id: release.id,
			},
			ranobeBot,
		);

		await testReleases({
			id: release.id,
			cb_publisher: (r) => {
				expect(r.books.length).toBe(1);
				expect(r.books[0].rtype).toBe('partial');
				expect(r.publishers.length).toBe(1);
				expect(r.publishers[0].publisher_type).toBe('imprint');
			},
		});

		changedRelease = await dbReleases.getReleaseEdit(release.id).executeTakeFirstOrThrow();
		await dbReleaseActions.editRelease(
			{
				release: {
					...changedRelease,
					books: [],
					publishers: [],
					comment: 'Edit',
				},
				id: release.id,
			},
			ranobeBot,
		);

		await testReleases({
			id: release.id,
			cb_publisher: (r) => {
				expect(r.books.length).toBe(0);
				expect(r.publishers.length).toBe(0);
			},
		});
	});

	it('should add a release', async () => {
		const dbReleaseActions = DBReleaseActions.fromDB(db);
		const book = await db.selectFrom('book').selectAll().executeTakeFirstOrThrow();
		const publisher = await db.selectFrom('publisher').selectAll().executeTakeFirstOrThrow();
		const addedReleaseId = await dbReleaseActions.addRelease(
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
			},
			ranobeBot,
		);
		await testReleases({
			id: addedReleaseId,
			cb_publisher: (r) => {
				expect(r.books.length).toBe(1);
				expect(r.publishers.length).toBe(1);
			},
		});
	});
});
