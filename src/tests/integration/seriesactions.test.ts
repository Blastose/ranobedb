import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBSeriesActions } from '$lib/server/db/series/actions';
import { DBSeries, type SeriesEdit } from '$lib/server/db/series/series';
import type { MaybePromise } from '@sveltejs/kit';
import { setupSeriesEditObjsForEqualityTest } from '$lib/db/obj';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

async function testSeries(params: {
	id: number;
	cb_series: (series: SeriesEdit) => MaybePromise<void>;
}) {
	const { id, cb_series } = params;
	const dbSeries = DBSeries.fromDB(db);

	const series = await dbSeries.getSeriesOneEdit(id).executeTakeFirstOrThrow();

	const publisherHist = await dbSeries.getSeriesHistOneEdit({ id: id }).executeTakeFirstOrThrow();

	await cb_series(series);
	await cb_series(publisherHist);

	setupSeriesEditObjsForEqualityTest(series, publisherHist);
	expect(series).toStrictEqual(publisherHist);
}

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
		const tag = await db
			.insertInto('tag')
			.values({ description: '', name: 'romance', ttype: 'genre' })
			.returning('id')
			.executeTakeFirstOrThrow();
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
					tags: [{ id: tag.id, name: null }],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
				id: series.id,
			},
			ranobeBot,
		);

		await testSeries({
			id: series.id,
			cb_series: (s) => {
				expect(s.books.length).toBe(1);
				expect(s.books.at(0)?.book_type).toBe('main');
				expect(s.tags.length).toBe(1);
				expect(s.child_series.at(0)?.relation_type).toBe('prequel');
			},
		});

		await testSeries({
			id: otherSeries.id,
			cb_series: (s) => {
				expect(s.child_series.length).toBe(1);
				expect(s.child_series.at(0)?.relation_type).toBe('sequel');
			},
		});

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
					tags: [],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
				id: series.id,
			},
			ranobeBot,
		);

		await testSeries({
			id: series.id,
			cb_series: (s) => {
				expect(s.books.length).toBe(0);
				expect(s.tags.length).toBe(0);
				expect(s.child_series.at(0)?.relation_type).toBe('parent story');
			},
		});

		await testSeries({
			id: otherSeries.id,
			cb_series: (s) => {
				expect(s.child_series.length).toBe(1);
				expect(s.child_series.at(0)?.relation_type).toBe('spin-off');
			},
		});

		const allTags = await db.selectFrom('tag').selectAll().execute();
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
						{
							lang: 'en',
							official: true,
							title: 'Konnichiwa',
						},
					],
					tags: allTags,
					aliases: 'alias here',
					end_date: 99999999,
					start_date: 16660205,
					olang: 'en',
					bookwalker_id: 132,
				},
				id: series.id,
			},
			ranobeBot,
		);

		await testSeries({
			id: series.id,
			cb_series: (s) => {
				expect(s.books.length).toBe(0);
				expect(s.tags.length).toBe(2);
				expect(s.child_series.length).toBe(0);
			},
		});

		await testSeries({
			id: otherSeries.id,
			cb_series: (s) => {
				expect(s.books.length).toBe(0);
				expect(s.child_series.length).toBe(0);
			},
		});
	});

	it('should add a series', async () => {
		const dbSeriesActions = DBSeriesActions.fromDB(db);
		const otherSeries = await db.selectFrom('series').selectAll().executeTakeFirstOrThrow();
		const book = await db.selectFrom('book').selectAll().executeTakeFirstOrThrow();
		const addedSeriesId = await dbSeriesActions.addSeries(
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
					publication_status: 'unknown',
					titles: [
						{
							lang: 'ja',
							official: true,
							title: 'こんにちは',
						},
					],
					tags: [],
					aliases: '',
					end_date: 99999999,
					start_date: 99999999,
					olang: 'ja',
				},
			},
			ranobeBot,
		);
		await testSeries({
			id: addedSeriesId,
			cb_series: (s) => {
				expect(s.books.length).toBe(1);
				expect(s.books.at(0)?.book_type).toBe('main');
				expect(s.tags.length).toBe(0);
				expect(s.child_series.length).toBe(1);
				expect(s.child_series.at(0)?.relation_type).toBe('prequel');
			},
		});
		await testSeries({
			id: otherSeries.id,
			cb_series: (s) => {
				expect(s.child_series.length).toBe(1);
				expect(s.child_series.at(0)?.relation_type).toBe('sequel');
			},
		});
	});
});
