import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBPublisherActions } from '$lib/server/db/publishers/actions';
import { DBPublishers } from '$lib/server/db/publishers/publishers';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

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
				},
				id: publisher.id,
			},
			ranobeBot,
		);
		const dbPublishers = DBPublishers.fromDB(db);
		const changedPublisher = await dbPublishers
			.getPublisher(publisher.id)
			.executeTakeFirstOrThrow();
		expect(changedPublisher.child_publishers.length).toBe(1);

		const publisherHist = await dbPublishers
			.getPublisherHist({ id: publisher.id })
			.executeTakeFirstOrThrow();
		expect(publisherHist.child_publishers.length).toBe(1);

		const otherPublisherUpdated = await dbPublishers
			.getPublisher(otherPublisher.id)
			.executeTakeFirstOrThrow();
		expect(otherPublisherUpdated.child_publishers.at(0)?.relation_type).toBe('parent brand');

		const otherPublisherHist = await dbPublishers
			.getPublisherHist({ id: otherPublisherUpdated.id })
			.executeTakeFirstOrThrow();
		expect(otherPublisherHist.child_publishers.length).toBe(1);
		expect(otherPublisherHist.child_publishers.at(0)?.relation_type).toBe('parent brand');

		await dbPublisherActions.editPublisher(
			{
				publisher: {
					comment: 'Test',
					hidden: false,
					locked: false,
					child_publishers: [],
					name: 'Publisher',
				},
				id: publisher.id,
			},
			ranobeBot,
		);

		const otherPublisherUpdatedAfter = await dbPublishers
			.getPublisher(otherPublisher.id)
			.executeTakeFirstOrThrow();
		expect(otherPublisherUpdatedAfter.child_publishers.length).toBe(0);

		const otherPublisherHistAfter = await dbPublishers
			.getPublisherHist({ id: otherPublisherUpdatedAfter.id })
			.executeTakeFirstOrThrow();
		expect(otherPublisherHistAfter.child_publishers.length).toBe(0);
	});

	it('should add a publisher', async () => {
		const dbPublisherActions = DBPublisherActions.fromDB(db);
		const addedPublisherId = await dbPublisherActions.addPublisher(
			{
				publisher: {
					comment: 'Test',
					hidden: false,
					locked: false,
					child_publishers: [],
					name: 'Publisher',
				},
			},
			ranobeBot,
		);
		const dbPublishers = DBPublishers.fromDB(db);
		const addedPublisher = await dbPublishers
			.getPublisher(addedPublisherId)
			.executeTakeFirstOrThrow();
		expect(addedPublisher.child_publishers.length).toBe(0);
	});
});
