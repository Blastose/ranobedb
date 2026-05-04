import { db } from '$lib/server/db/db';
import { sql } from 'kysely';
import type { Language } from '../dbTypes';
import { getTodayAsDateNumber } from '$lib/components/form/release/releaseDate';

export async function updateSeriesStartEndDates() {
	// Run after updateBookReleaseDate()
	console.log('Running update series start and end dates job');
	await db
		.with('rel', (db) =>
			db
				.selectFrom('series')
				.innerJoin('series_book', 'series_book.series_id', 'series.id')
				.innerJoin('book', 'book.id', 'series_book.book_id')
				.where('book.hidden', '=', false)
				.groupBy('series.id')
				.select((eb) => [
					'series.id',
					eb.fn.min<number>('book.c_release_date').as('min_book_date'),
					eb.fn.max<number>('book.c_release_date').as('latest_book_date'),
				])
				.select((eb) =>
					eb
						.case()
						.when('series.publication_status', '=', 'completed')
						.then(eb.fn.max<number>('book.c_release_date'))
						.else(eb.val(99999999))
						.end()
						.as('max_book_date'),
				),
		)
		.updateTable('series')
		.from('rel')
		.set((eb) => ({
			c_start_date: eb.ref('rel.min_book_date'),
			c_end_date: eb.ref('rel.max_book_date'),
			c_latest_release_date: eb.ref('rel.latest_book_date'),
		}))
		.whereRef('series.id', '=', 'rel.id')
		.execute();
}

export async function updateSeriesPopularity() {
	console.log('Running update series popularity job');
	await db
		.with('rel', (db) =>
			db
				.selectFrom('series')
				.innerJoin('user_list_series', 'user_list_series.series_id', 'series.id')
				.groupBy('series.id')
				.select((eb) => ['series.id', eb.fn.count<number>('series.id').as('pop')]),
		)
		.updateTable('series')
		.from('rel')
		.set((eb) => ({
			c_popularity: eb.ref('rel.pop'),
		}))
		.whereRef('series.id', '=', 'rel.id')
		.execute();
}

export async function updateSeriesAverage() {
	console.log('Running update series average job');
	await db.transaction().execute(async (trx) => {
		await trx.updateTable('series').set({ c_average: 0 }).execute();
		await trx
			.with('stats', (db) =>
				db
					.selectFrom('user_list_series')
					.select((eb) => [
						eb.fn.avg<number>('user_list_series.score').as('avg_glob'),
						eb.lit<number>(15).as('min_votes_threshold'),
					]),
			)
			.with('series_scores', (db) =>
				db
					.selectFrom('user_list_series')
					.groupBy('user_list_series.series_id')
					.select((eb) => [
						'user_list_series.series_id',
						eb.fn.avg<number>('user_list_series.score').as('avg_score'),
						eb.fn.count<number>('user_list_series.score').as('vote_count'),
					]),
			)
			.with('combined', (db) => db.selectFrom('series_scores').crossJoin('stats').selectAll())
			.with('rel', (db) =>
				db.selectFrom('combined').select([
					sql<number>`
					coalesce(((((combined.vote_count / (combined.vote_count + combined.min_votes_threshold)::float) * combined.avg_score) + ((combined.min_votes_threshold / (combined.vote_count + combined.min_votes_threshold)::float) * combined.avg_glob)) * 100)::integer, 0)
					`.as('bayesian_avg'),
					'combined.series_id',
				]),
			)
			.updateTable('series')
			.from('rel')
			.set((eb) => ({
				c_average: eb.ref('rel.bayesian_avg'),
			}))
			.whereRef('series.id', '=', 'rel.series_id')
			.execute();
	});
}

export async function updateSeriesTranslated() {
	console.log('Running update series translated job');
	await db.transaction().execute(async (trx) => {
		await trx.updateTable('series').set('c_fully_translated', []).execute();
		await trx
			.with('rel', (db) =>
				db
					.selectFrom('series')
					.innerJoin('series_book', 'series_book.series_id', 'series.id')
					.innerJoin('book', 'book.id', 'series_book.book_id')
					.distinctOn('series.id')
					.select(['series.id as series_id', 'series_book.sort_order'])
					.select(
						sql<Language[]>`array(select jsonb_object_keys(book.c_release_dates))::language[]`.as(
							'langs',
						),
					)
					.where('book.hidden', '=', false)
					.where('series.hidden', '=', false)
					.where('series_book.book_type', '=', 'main')
					.orderBy('series.id')
					.orderBy('series_book.sort_order', 'desc'),
			)
			.updateTable('series')
			.from('rel')
			.set((eb) => ({
				c_fully_translated: eb.ref('rel.langs'),
			}))
			.whereRef('series.id', '=', 'rel.series_id')
			.execute();
	});
}

export async function updateNewlyLicensedEnglishSeries() {
	await db.transaction().execute(async (trx) => {
		const licensedSeriesIds = await db
			.with('licensed_series', (db) =>
				db
					.selectFrom('change')
					.innerJoin('release', 'release.id', 'change.item_id')
					.innerJoin('release_book', 'release_book.release_id', 'release.id')
					.innerJoin('series_book', 'series_book.book_id', 'release_book.book_id')
					.select([
						'series_book.series_id',
						(eb) => eb.fn.min('release.release_date').as('earliest_release'),
						(eb) => eb.fn.max('change.added').as('latest_change'),
					])
					.where('change.item_name', '=', 'release')
					.where('change.revision', '=', 1)
					.where('release.lang', '=', 'en')
					.where('release.release_date', '<', 99999999)
					.where('release.hidden', '=', false)
					.where('series_book.sort_order', '=', 1)
					.groupBy('series_book.series_id'),
			)
			.selectFrom('licensed_series')
			.select('licensed_series.series_id')
			.where('licensed_series.earliest_release', '>=', getTodayAsDateNumber())
			.orderBy('latest_change', 'desc')
			.limit(24)
			.execute();

		await trx
			.insertInto('kv_store')
			.values({
				key: 'newly_licensed_en',
				value: JSON.stringify(licensedSeriesIds),
			})
			.onConflict((oc) =>
				oc.column('key').doUpdateSet({
					value: JSON.stringify(licensedSeriesIds),
					updated_at: new Date(),
				}),
			)
			.execute();
	});
}
