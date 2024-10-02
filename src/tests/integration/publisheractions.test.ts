import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBPublisherActions } from '$lib/server/db/publishers/actions';
import { DBPublishers, type PublisherEdit } from '$lib/server/db/publishers/publishers';
import { setupPublisherEditObjsForEqualityTest } from '$lib/db/obj';
import type { MaybePromise } from '$lib/utils/types';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

async function testPublishers(params: {
	id: number;
	cb_publisher: (pub: PublisherEdit) => MaybePromise<void>;
}) {
	const { id, cb_publisher } = params;
	const dbPublishers = DBPublishers.fromDB(db);

	const publisher = await dbPublishers.getPublisherEdit(id).executeTakeFirstOrThrow();

	const publisherHist = await dbPublishers
		.getPublisherHistEdit({ id: id })
		.executeTakeFirstOrThrow();

	await cb_publisher(publisher);
	await cb_publisher(publisherHist);

	setupPublisherEditObjsForEqualityTest(publisher, publisherHist);
	expect(publisher).toStrictEqual(publisherHist);
}

describe('publisher actions', () => {
	it('should edit the publisher', async () => {
		const dbPublisherActions = DBPublisherActions.fromDB(db);
		const publisher = await db.selectFrom('publisher').select('id').executeTakeFirstOrThrow();
		const otherPublisher = await db
			.selectFrom('publisher')
			.where('publisher.id', '!=', publisher.id)
			.selectAll()
			.executeTakeFirstOrThrow();
		await dbPublisherActions.editPublisher(
			{
				publisher: {
					comment: 'Test',
					hidden: false,
					locked: false,
					child_publishers: [
						{ id: otherPublisher.id, name: otherPublisher.name, relation_type: 'imprint' },
					],
					name: 'Publisher',
					bookwalker: 'https://bookwalker.jp/company/24/',
					website: 'https://www.example.com',
					twitter_id: 'example',
					wikidata_id: 1,
				},
				id: publisher.id,
			},
			ranobeBot,
		);
		const dbPublishers = DBPublishers.fromDB(db);
		let changedPublisher = await dbPublishers
			.getPublisherEdit(publisher.id)
			.executeTakeFirstOrThrow();

		await testPublishers({
			id: publisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(1);
				expect(p.child_publishers.at(0)?.relation_type).toBe('imprint');
			},
		});

		await testPublishers({
			id: otherPublisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(1);
				expect(p.child_publishers.at(0)?.relation_type).toBe('parent brand');
			},
		});

		await dbPublisherActions.editPublisher(
			{
				publisher: {
					...changedPublisher,
					child_publishers: [
						{ id: otherPublisher.id, name: otherPublisher.name, relation_type: 'parent company' },
					],
					bookwalker: undefined,
					website: undefined,
					twitter_id: undefined,
					wikidata_id: undefined,
					comment: 'Edit',
				},
				id: publisher.id,
			},
			ranobeBot,
		);

		await testPublishers({
			id: publisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(1);
				expect(p.child_publishers.at(0)?.relation_type).toBe('parent company');
			},
		});
		await testPublishers({
			id: otherPublisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(1);
				expect(p.child_publishers.at(0)?.relation_type).toBe('subsidiary');
			},
		});

		changedPublisher = await dbPublishers.getPublisherEdit(publisher.id).executeTakeFirstOrThrow();
		await dbPublisherActions.editPublisher(
			{
				publisher: { ...changedPublisher, child_publishers: [], comment: 'Edit' },
				id: publisher.id,
			},
			ranobeBot,
		);

		await testPublishers({
			id: publisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(0);
			},
		});

		await testPublishers({
			id: otherPublisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(0);
			},
		});
	});

	it('should add a publisher', async () => {
		const dbPublisherActions = DBPublisherActions.fromDB(db);
		const otherPublisher = await db.selectFrom('publisher').selectAll().executeTakeFirstOrThrow();
		const addedPublisherId = await dbPublisherActions.addPublisher(
			{
				publisher: {
					comment: 'Test',
					hidden: false,
					locked: false,
					child_publishers: [
						{ id: otherPublisher.id, name: otherPublisher.name, relation_type: 'imprint' },
					],
					name: 'Publisher',
				},
			},
			ranobeBot,
		);
		await testPublishers({
			id: addedPublisherId,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(1);
			},
		});

		await testPublishers({
			id: otherPublisher.id,
			cb_publisher: (p) => {
				expect(p.child_publishers.length).toBe(1);
			},
		});
	});
});
