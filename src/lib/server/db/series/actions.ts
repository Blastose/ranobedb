import type { seriesSchema } from '$lib/server/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { RanobeDB } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import {
	type DB,
	type SeriesRelType,
	type SeriesRelationHist,
	type SeriesRelation,
	type SeriesBookHist,
	type SeriesBook,
	type SeriesTitle,
	type SeriesTitleHist,
} from '$lib/server/db/dbTypes';
import { seriesRelTypeReverseMap } from '$lib/db/dbConsts';
import type { Insertable, Kysely, Transaction } from 'kysely';
import { arrayDiff, arrayIntersection } from '$lib/db/array';
import { reverseRelationUpdateMarkdown } from '$lib/db/revision';

async function getSeriesForReverseRelation(params: { trx: Transaction<DB>; series_ids: number[] }) {
	return await params.trx
		.selectFrom('series')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('series_relation')
					.innerJoin('series as series_child', 'series_child.id', 'series_relation.id_child')
					.select([
						'series_relation.id_parent',
						'series_relation.id_child',
						'series_relation.relation_type',
					])
					.select(['series_child.id'])
					.whereRef('series_relation.id_parent', '=', 'series.id')
					.where('series.hidden', '=', false),
			).as('child_series'),
			jsonArrayFrom(
				eb
					.selectFrom('book')
					.innerJoin('series_book', 'series_book.book_id', 'book.id')
					.whereRef('series_book.series_id', '=', 'series.id')
					.select([
						'series_book.book_id',
						'series_book.series_id',
						'series_book.sort_order',
						'series_book.book_type',
					]),
			).as('books'),
			jsonArrayFrom(
				eb
					.selectFrom('series_title')
					.whereRef('series_title.series_id', '=', 'series.id')
					.selectAll('series_title'),
			).as('titles'),
		])
		.selectAll('series')
		.where('series.id', 'in', params.series_ids)
		.execute();
}

async function addMiscSeriesRelations(params: {
	trx: Transaction<DB>;
	series: Awaited<ReturnType<typeof getSeriesForReverseRelation>>[number];
	change_id: number;
}) {
	const batch_add_books = params.series.books.map((item) => ({
		book_id: item.book_id,
		change_id: params.change_id,
		sort_order: item.sort_order,
		book_type: item.book_type,
	})) satisfies Insertable<SeriesBookHist>[];
	if (batch_add_books.length > 0) {
		await params.trx.insertInto('series_book_hist').values(batch_add_books).execute();
	}
	const batch_add_titles = params.series.titles.map((item) => ({
		change_id: params.change_id,
		lang: item.lang,
		official: item.official,
		title: item.title,
		romaji: item.romaji,
	})) satisfies Insertable<SeriesTitleHist>[];
	if (batch_add_titles.length > 0) {
		await params.trx.insertInto('series_title_hist').values(batch_add_titles).execute();
	}
}

async function updateReverseSeriesRelations(params: {
	trx: Transaction<DB>;
	main_id: number;
	og_change: { revision: number };
	series: {
		id: number;
		relation_type: SeriesRelType;
	}[];
}) {
	const reverse_series = await getSeriesForReverseRelation({
		trx: params.trx,
		series_ids: params.series.map((i) => i.id),
	});

	for (const series of params.series) {
		const series_to_update = reverse_series.find((item) => item.id === series.id);
		if (!series_to_update) continue;

		const newRelationType = seriesRelTypeReverseMap[series.relation_type];

		const reverseRelChange = await addChange(
			params.trx,
			{
				comments: reverseRelationUpdateMarkdown(
					's',
					'series',
					params.main_id,
					params.og_change.revision,
				),
				hidden: false,
				locked: false,
				item_id: series.id,
				item_name: 'series',
			},
			{ id: 'RanobeBot' },
		);
		const current = series_to_update.child_series;
		await params.trx
			.updateTable('series_relation')
			.set({
				relation_type: newRelationType,
			})
			.where('series_relation.id_parent', '=', series.id)
			.where('series_relation.id_child', '=', params.main_id)
			.execute();

		const batch_add = current
			.filter((item) => item.id_child !== params.main_id)
			.map((item) => ({
				change_id: reverseRelChange.change_id,
				id_child: item.id_child,
				relation_type: item.relation_type,
			})) satisfies Insertable<SeriesRelationHist>[];
		batch_add.push({
			change_id: reverseRelChange.change_id,
			relation_type: seriesRelTypeReverseMap[series.relation_type],
			id_child: params.main_id,
		});
		await params.trx
			.insertInto('series_hist')
			.values({
				change_id: reverseRelChange.change_id,
				publication_status: series_to_update.publication_status,
				description: series_to_update.description,
				bookwalker_id: series_to_update.bookwalker_id,
				aliases: series_to_update.aliases,
				end_date: series_to_update.end_date,
				start_date: series_to_update.start_date,
				anidb_id: series_to_update.anidb_id,
				web_novel: series_to_update.web_novel,
				wikidata_id: series_to_update.wikidata_id,
			})
			.execute();
		if (batch_add.length > 0) {
			await params.trx.insertInto('series_relation_hist').values(batch_add).execute();
		}

		await addMiscSeriesRelations({
			trx: params.trx,
			change_id: reverseRelChange.change_id,
			series: series_to_update,
		});
	}
}

async function removeReverseSeriesRelations(params: {
	trx: Transaction<DB>;
	main_id: number;
	og_change: { revision: number };
	series_ids: number[];
}) {
	const reverse_series = await getSeriesForReverseRelation({
		trx: params.trx,
		series_ids: params.series_ids,
	});

	for (const id of params.series_ids) {
		const series_to_remove = reverse_series.find((item) => item.id === id);
		if (!series_to_remove) continue;

		const reverseRelChange = await addChange(
			params.trx,
			{
				comments: reverseRelationUpdateMarkdown(
					's',
					'series',
					params.main_id,
					params.og_change.revision,
				),
				hidden: false,
				locked: false,
				item_id: id,
				item_name: 'series',
			},
			{ id: 'RanobeBot' },
		);
		let current = series_to_remove.child_series;
		await params.trx
			.deleteFrom('series_relation')
			.where('id_child', '=', params.main_id)
			.where('id_parent', '=', id)
			.execute();
		await params.trx
			.insertInto('series_hist')
			.values({
				change_id: reverseRelChange.change_id,
				publication_status: series_to_remove.publication_status,
				description: series_to_remove.description,
				bookwalker_id: series_to_remove.bookwalker_id,
				aliases: series_to_remove.aliases,
				end_date: series_to_remove.end_date,
				start_date: series_to_remove.start_date,
				anidb_id: series_to_remove.anidb_id,
				web_novel: series_to_remove.web_novel,
				wikidata_id: series_to_remove.wikidata_id,
			})
			.execute();
		current = current.filter((item) => item.id_child !== params.main_id);
		if (current.length > 0) {
			await params.trx
				.insertInto('series_relation_hist')
				.values(
					current.map((c) => ({
						change_id: reverseRelChange.change_id,
						id_child: c.id_child,
						relation_type: c.relation_type,
					})),
				)
				.execute();
		}
		await addMiscSeriesRelations({
			trx: params.trx,
			change_id: reverseRelChange.change_id,
			series: series_to_remove,
		});
	}
}

async function addReverseSeriesRelations(params: {
	trx: Transaction<DB>;
	main_id: number;
	og_change: { revision: number };
	series: {
		id: number;
		relation_type: SeriesRelType;
	}[];
}) {
	const reverse_series = await getSeriesForReverseRelation({
		trx: params.trx,
		series_ids: params.series.map((i) => i.id),
	});

	for (const series of params.series) {
		const series_to_add = reverse_series.find((item) => item.id === series.id);
		if (!series_to_add) {
			continue;
		}

		const reverseRelChange = await addChange(
			params.trx,
			{
				comments: reverseRelationUpdateMarkdown(
					's',
					'series',
					params.main_id,
					params.og_change.revision,
				),
				hidden: false,
				locked: false,
				item_id: series.id,
				item_name: 'series',
			},
			{ id: 'RanobeBot' },
		);
		const current = series_to_add.child_series;
		const newRelation = {
			id_child: params.main_id,
			id_parent: series.id,
			relation_type: seriesRelTypeReverseMap[series.relation_type],
		};
		await params.trx.insertInto('series_relation').values(newRelation).execute();

		const batch_add = current.map((item) => ({
			change_id: reverseRelChange.change_id,
			id_child: item.id_child,
			relation_type: item.relation_type,
		})) satisfies Insertable<SeriesRelationHist>[];
		batch_add.push({
			change_id: reverseRelChange.change_id,
			relation_type: seriesRelTypeReverseMap[series.relation_type],
			id_child: params.main_id,
		});
		await params.trx
			.insertInto('series_hist')
			.values({
				change_id: reverseRelChange.change_id,
				publication_status: series_to_add.publication_status,
				description: series_to_add.description,
				bookwalker_id: series_to_add.bookwalker_id,
				aliases: series_to_add.aliases,
				end_date: series_to_add.end_date,
				start_date: series_to_add.start_date,
				anidb_id: series_to_add.anidb_id,
				web_novel: series_to_add.web_novel,
				wikidata_id: series_to_add.wikidata_id,
			})
			.execute();
		if (batch_add.length > 0) {
			await params.trx.insertInto('series_relation_hist').values(batch_add).execute();
		}
		await addMiscSeriesRelations({
			trx: params.trx,
			change_id: reverseRelChange.change_id,
			series: series_to_add,
		});
	}
}

export class DBSeriesActions {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>) {
		const ranobeDB = new RanobeDB(db);
		return new this(ranobeDB);
	}

	async editSeries(data: { series: Infer<typeof seriesSchema>; id: number }, user: User) {
		await this.ranobeDB.db.transaction().execute(async (trx) => {
			const currentSeries = await trx
				.selectFrom('series')
				.where('series.id', '=', data.id)
				.select(['series.hidden', 'series.locked'])
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom('series_relation')
							.innerJoin('series', 'series.id', 'series_relation.id_child')
							.select(['series_relation.id_child as id', 'series_relation.relation_type'])
							.where('series_relation.id_parent', '=', data.id)
							.where('series.hidden', '=', false),
					).as('child_series'),
					jsonArrayFrom(
						eb
							.selectFrom('book')
							.innerJoin('series_book', 'series_book.book_id', 'book.id')
							.whereRef('series_book.series_id', '=', 'series.id')
							.select(['book.id', 'series_book.sort_order', 'series_book.book_type'])
							.orderBy('sort_order desc'),
					).as('books'),
				])
				.executeTakeFirstOrThrow();

			const userHasVisibilityPerms = hasVisibilityPerms(user);
			const hidden = userHasVisibilityPerms ? data.series.hidden : currentSeries.hidden;
			const locked = userHasVisibilityPerms
				? data.series.hidden || data.series.locked
				: currentSeries.locked;

			if (currentSeries.hidden || currentSeries.locked) {
				if (!userHasVisibilityPerms) {
					throw new ChangePermissionError('');
				}
			}

			if (!currentSeries.hidden && data.series.hidden) {
				if (currentSeries.child_series.length + currentSeries.books.length > 0) {
					throw new HasRelationsError('');
				}
			}

			const change = await addChange(
				trx,
				{
					comments: data.series.comment,
					hidden,
					locked,
					item_id: data.id,
					item_name: 'series',
				},
				user,
			);

			await trx
				.updateTable('series')
				.set({
					bookwalker_id: data.series.bookwalker_id,
					publication_status: data.series.publication_status,
					description: data.series.description || '',
					hidden,
					locked,
				})
				.where('series.id', '=', data.id)
				.executeTakeFirstOrThrow();

			await trx
				.insertInto('series_hist')
				.values({
					publication_status: data.series.publication_status,
					bookwalker_id: data.series.bookwalker_id,
					change_id: change.change_id,
					description: data.series.description || '',
					aliases: data.series.aliases,
					end_date: data.series.end_date,
					start_date: data.series.start_date,
					anidb_id: data.series.anidb_id,
					web_novel: data.series.web_novel,
					wikidata_id: data.series.wikidata_id,
				})
				.executeTakeFirstOrThrow();

			// series_title
			await trx.deleteFrom('series_title').where('series_title.series_id', '=', data.id).execute();
			const series_title_add = data.series.titles.map((item) => {
				return {
					series_id: data.id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<SeriesTitle>[];
			if (series_title_add.length > 0) {
				await trx.insertInto('series_title').values(series_title_add).execute();
			}
			const series_title_hist_add = data.series.titles.map((item) => {
				return {
					change_id: change.change_id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<SeriesTitleHist>[];
			if (series_title_hist_add.length > 0) {
				await trx.insertInto('series_title_hist').values(series_title_hist_add).execute();
			}

			// series_book_hist
			// add all
			const series_book_hist = data.series.books.map((item) => {
				return {
					change_id: change.change_id,
					book_id: item.id,
					sort_order: item.sort_order,
					book_type: item.book_type,
				};
			}) satisfies Insertable<SeriesBookHist>[];
			if (series_book_hist.length > 0) {
				await trx.insertInto('series_book_hist').values(series_book_hist).execute();
			}

			// series_book
			const booksCurrentDiff = arrayDiff(currentSeries.books, data.series.books);
			if (booksCurrentDiff.length > 0) {
				await trx
					.deleteFrom('series_book')
					.where(
						'book_id',
						'in',
						booksCurrentDiff.map((item) => item.id),
					)
					.where('series_book.series_id', '=', data.id)
					.execute();
			}
			const booksToUpdate = arrayIntersection(data.series.books, currentSeries.books);
			for (const item of booksToUpdate) {
				await trx
					.updateTable('series_book')
					.set({
						sort_order: item.sort_order,
					})
					.where('series_book.series_id', '=', data.id)
					.where('series_book.book_id', '=', item.id)
					.execute();
			}
			const booksNewDiff = arrayDiff(data.series.books, currentSeries.books);
			const series_book_add = booksNewDiff.map((item) => {
				return {
					book_id: item.id,
					series_id: data.id,
					sort_order: item.sort_order,
					book_type: item.book_type,
				};
			}) satisfies Insertable<SeriesBook>[];
			if (series_book_add.length > 0) {
				await trx.insertInto('series_book').values(series_book_add).execute();
			}

			// series_relation_hist
			const series_relations_hist = data.series.child_series.map((item) => {
				return {
					change_id: change.change_id,
					id_child: item.id,
					relation_type: item.relation_type,
				};
			}) satisfies Insertable<SeriesRelationHist>[];
			if (series_relations_hist.length > 0) {
				await trx.insertInto('series_relation_hist').values(series_relations_hist).execute();
			}

			const currentDiff = arrayDiff(currentSeries.child_series, data.series.child_series);

			if (currentDiff.length > 0) {
				await trx
					.deleteFrom('series_relation')
					.where(
						'series_relation.id_child',
						'in',
						currentDiff.map((item) => item.id),
					)
					.where('series_relation.id_parent', '=', data.id)
					.execute();
			}
			// Remove reverse series rels
			if (currentDiff.length > 0) {
				await removeReverseSeriesRelations({
					trx,
					main_id: data.id,
					og_change: change,
					series_ids: currentDiff.map((i) => i.id),
				});
			}

			const toUpdate = data.series.child_series.filter((item1) =>
				currentSeries.child_series.some(
					(item2) => item2.id === item1.id && item1.relation_type !== item2.relation_type,
				),
			);

			for (const item of toUpdate) {
				await trx
					.updateTable('series_relation')
					.set({
						relation_type: item.relation_type,
					})
					.where('series_relation.id_parent', '=', data.id)
					.where('series_relation.id_child', '=', item.id)
					.execute();
			}
			// update reverse series rels
			if (toUpdate.length > 0) {
				await updateReverseSeriesRelations({
					trx,
					main_id: data.id,
					og_change: change,
					series: toUpdate,
				});
			}

			const newDiff = arrayDiff(data.series.child_series, currentSeries.child_series);
			const series_relations = newDiff.map((item) => {
				return { id_parent: data.id, id_child: item.id, relation_type: item.relation_type };
			}) satisfies Insertable<SeriesRelation>[];
			if (series_relations.length > 0) {
				await trx.insertInto('series_relation').values(series_relations).execute();
			}

			// add reverse relations
			if (newDiff.length > 0) {
				await addReverseSeriesRelations({
					trx,
					main_id: data.id,
					og_change: change,
					series: newDiff,
				});
			}
		});
	}

	async addSeries(data: { series: Infer<typeof seriesSchema> }, user: User) {
		return await this.ranobeDB.db.transaction().execute(async (trx) => {
			const canChangeVisibility = permissions[user.role].includes('visibility');
			const hidden = canChangeVisibility ? data.series.hidden : false;
			const locked = canChangeVisibility ? data.series.hidden || data.series.locked : false;

			const insertedSeries = await trx
				.insertInto('series')
				.values({
					publication_status: data.series.publication_status,
					bookwalker_id: data.series.bookwalker_id,
					description: data.series.description || '',
					aliases: data.series.aliases,
					end_date: data.series.end_date,
					start_date: data.series.start_date,
					anidb_id: data.series.anidb_id,
					web_novel: data.series.web_novel,
					wikidata_id: data.series.wikidata_id,
					hidden,
					locked,
				})
				.returning('series.id')
				.executeTakeFirstOrThrow();

			const change = await addChange(
				trx,
				{
					comments: data.series.comment,
					hidden,
					locked,
					item_id: insertedSeries.id,
					item_name: 'series',
				},
				user,
			);

			await trx
				.insertInto('series_hist')
				.values({
					publication_status: data.series.publication_status,
					bookwalker_id: data.series.bookwalker_id,
					description: data.series.description || '',
					change_id: change.change_id,
					aliases: data.series.aliases,
					end_date: data.series.end_date,
					start_date: data.series.start_date,
					anidb_id: data.series.anidb_id,
					web_novel: data.series.web_novel,
					wikidata_id: data.series.wikidata_id,
				})
				.executeTakeFirstOrThrow();
			const series_relations = data.series.child_series.map((item) => {
				return {
					id_parent: insertedSeries.id,
					id_child: item.id,
					relation_type: item.relation_type,
				};
			}) satisfies Insertable<SeriesRelation>[];
			if (series_relations.length > 0) {
				await trx.insertInto('series_relation').values(series_relations).execute();
			}

			// add reverse series rels
			if (data.series.child_series.length > 0) {
				await addReverseSeriesRelations({
					trx,
					main_id: insertedSeries.id,
					og_change: change,
					series: data.series.child_series,
				});
			}

			// series_title
			const series_title_add = data.series.titles.map((item) => {
				return {
					series_id: insertedSeries.id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<SeriesTitle>[];
			if (series_title_add.length > 0) {
				await trx.insertInto('series_title').values(series_title_add).execute();
			}
			const series_title_hist_add = data.series.titles.map((item) => {
				return {
					change_id: change.change_id,
					lang: item.lang,
					official: item.official,
					title: item.title,
					romaji: item.romaji,
				};
			}) satisfies Insertable<SeriesTitleHist>[];
			if (series_title_hist_add.length > 0) {
				await trx.insertInto('series_title_hist').values(series_title_hist_add).execute();
			}

			// series_book
			const series_book_add = data.series.books.map((item) => {
				return {
					book_id: item.id,
					series_id: insertedSeries.id,
					sort_order: item.sort_order,
					book_type: item.book_type,
				};
			}) satisfies Insertable<SeriesBook>[];
			if (series_book_add.length > 0) {
				await trx.insertInto('series_book').values(series_book_add).execute();
			}
			const series_book_add_hist = data.series.books.map((item) => {
				return {
					book_id: item.id,
					change_id: change.change_id,
					sort_order: item.sort_order,
					book_type: item.book_type,
				};
			}) satisfies Insertable<SeriesBookHist>[];
			if (series_book_add.length > 0) {
				await trx.insertInto('series_book_hist').values(series_book_add_hist).execute();
			}

			return insertedSeries.id;
		});
	}
}
