import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBSeriesActions } from '$lib/server/db/series/actions';
import { DBSeries } from '$lib/server/db/series/series';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

describe('series actions', () => {
	it('should edit the series', async () => {
		const dbSeriesActions = DBSeriesActions.fromDB(db);
		const series = await db.selectFrom('series').select('id').executeTakeFirstOrThrow();
		const otherSeries = await db
			.selectFrom('series')
			.where('series.id', '!=', series.id)
			.selectAll()
			.executeTakeFirstOrThrow();
		const book = await db.selectFrom('book').selectAll().executeTakeFirstOrThrow();
		await dbSeriesActions.editSeries(
			{
				series: {
					comment: 'Test',
					hidden: false,
					locked: false,
					books: [{ id: book.id, sort_order: 1, book_type: 'main' }],
					child_series: [
						{
							id: otherSeries.id,
							relation_type: 'prequel',
						},
					],
					publication_status: 'ongoing',
					titles: [{ lang: 'ja', official: true, title: 'Series Title 3' }],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
				id: series.id,
			},
			ranobeBot,
		);
		const dbSeries = DBSeries.fromDB(db);
		const changedSeries = await dbSeries.getSeriesOne(series.id).executeTakeFirstOrThrow();
		expect(changedSeries.books.length).toBe(1);

		const seriesHist = await dbSeries.getSeriesHistOne({ id: series.id }).executeTakeFirstOrThrow();
		expect(seriesHist.books.length).toBe(1);

		const otherSeriesUpdated = await dbSeries
			.getSeriesOne(otherSeries.id)
			.executeTakeFirstOrThrow();
		expect(otherSeriesUpdated.child_series.at(0)?.relation_type).toBe('sequel');

		const otherSeriesHist = await dbSeries
			.getSeriesHistOne({ id: otherSeriesUpdated.id })
			.executeTakeFirstOrThrow();
		expect(otherSeriesHist.child_series.at(0)?.relation_type).toBe('sequel');

		await dbSeriesActions.editSeries(
			{
				series: {
					comment: 'Test',
					hidden: false,
					locked: false,
					books: [],
					child_series: [
						{
							id: otherSeries.id,
							relation_type: 'parent story',
						},
					],
					publication_status: 'unknown',
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'こんにちは',
						},
					],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
				id: series.id,
			},
			ranobeBot,
		);

		const otherSeriesUpdatedAfter = await dbSeries
			.getSeriesOne(otherSeries.id)
			.executeTakeFirstOrThrow();
		expect(otherSeriesUpdatedAfter.child_series.at(0)?.relation_type).toBe('spin-off');

		const otherSeriesHistAfter = await dbSeries
			.getSeriesHistOne({ id: otherSeriesUpdatedAfter.id })
			.executeTakeFirstOrThrow();
		expect(otherSeriesHistAfter.child_series.at(0)?.relation_type).toBe('spin-off');

		await dbSeriesActions.editSeries(
			{
				series: {
					comment: 'Test',
					hidden: false,
					locked: false,
					books: [],
					child_series: [],
					publication_status: 'unknown',
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'こんにちは',
						},
					],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
				id: series.id,
			},
			ranobeBot,
		);

		const otherSeriesUpdatedAfter2 = await dbSeries
			.getSeriesOne(otherSeries.id)
			.executeTakeFirstOrThrow();
		expect(otherSeriesUpdatedAfter2.child_series.length).toBe(0);

		const otherSeriesHistAfter2 = await dbSeries
			.getSeriesHistOne({ id: otherSeriesUpdatedAfter2.id })
			.executeTakeFirstOrThrow();
		expect(otherSeriesHistAfter2.child_series.length).toBe(0);
	});

	it('should add a series', async () => {
		const dbSeriesActions = DBSeriesActions.fromDB(db);
		const addedSeriesId = await dbSeriesActions.addSeries(
			{
				series: {
					comment: 'Test',
					hidden: false,
					locked: false,
					books: [],
					child_series: [],
					publication_status: 'unknown',
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'こんにちは',
						},
					],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
			},
			ranobeBot,
		);
		const dbSeries = DBSeries.fromDB(db);
		const addedSeries = await dbSeries.getSeriesOne(addedSeriesId).executeTakeFirstOrThrow();
		expect(addedSeries.child_series.length).toBe(0);
	});
});
