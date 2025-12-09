import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import {
	type InferResult,
	type ExpressionBuilder,
	expressionBuilder,
	Kysely,
	sql,
	type SqlBool,
} from 'kysely';
import { RanobeDB } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';
import { type LanguagePriority } from '$lib/server/zod/schema';
import { defaultLangPrio, type UserListStatus } from '$lib/db/dbConsts';
import { withBookTitleCte } from '../books/books';
import type { User } from '$lib/server/lucia/lucia';
import { escapeRegex } from '$lib/db/match';

function titleCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title' | 'series'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		if (prio.romaji) {
			cb = cb
				.when(
					eb.and([
						eb('series_title.lang', '=', prio.lang),
						eb('series_title.romaji', 'is not', null),
					]),
				)
				.then(count);
		} else {
			cb = cb.when(eb.and([eb('series_title.lang', '=', prio.lang)])).then(count);
		}
		count++;
	}
	// Fallback to original title if there are no matches
	cb = cb.when('series_title.lang', '=', eb.ref('series.olang')).then(maxCount);
	return cb.else(maxCount + 1).end();
}

function titleHistCaseBuilder(
	eb: ExpressionBuilder<DB, 'series_title_hist' | 'series_hist'>,
	langPrios: LanguagePriority[],
) {
	// Kysely's CaseBuilder is not able to be assigned dynamically in a loop
	// so we need to make it as any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cb = eb.case() as unknown as any;
	let count = 1;
	const maxCount = 9999;
	for (const prio of langPrios) {
		if (prio.romaji) {
			cb = cb
				.when(
					eb.and([
						eb('series_title_hist.lang', '=', prio.lang),
						eb('series_title_hist.romaji', 'is not', null),
					]),
				)
				.then(count);
		} else {
			cb = cb.when(eb.and([eb('series_title_hist.lang', '=', prio.lang)])).then(count);
		}
		count++;
	}
	// Fallback to original title if there are no matches
	cb = cb.when('series_title_hist.lang', '=', eb.ref('series_hist.olang')).then(maxCount);
	return cb.else(maxCount + 1).end();
}

export function withSeriesTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, never>();
	return eb
		.selectFrom('series')
		.innerJoin('series_title', 'series_title.series_id', 'series.id')
		.leftJoin('series_title as series_title_orig', (join) =>
			join
				.onRef('series_title_orig.series_id', '=', 'series.id')
				.onRef('series_title_orig.lang', '=', 'series.olang'),
		)
		.distinctOn('series.id')
		.select([
			'series.id',
			'series.hidden',
			'series.locked',
			'series.publication_status',
			'series.bookwalker_id',
			'series.description',
			'series.aliases',
			'series.anidb_id',
			'series.start_date',
			'series.end_date',
			'series.c_start_date',
			'series.c_end_date',
			'series.c_latest_release_date',
			'series.c_popularity',
			'series.web_novel',
			'series.website',
			'series.wikidata_id',
			'series.anilist_id',
			'series.mal_id',
			'series.olang',
			'series.c_num_books',
		])
		.select(['series_title.lang', 'series_title.romaji', 'series_title.title'])
		.select(['series_title_orig.title as title_orig', 'series_title_orig.romaji as romaji_orig'])
		.orderBy('series.id')
		.orderBy((eb) => titleCaseBuilder(eb, langPrios ?? defaultLangPrio));
}

export function withSeriesHistTitleCte(langPrios?: LanguagePriority[]) {
	const eb = expressionBuilder<DB, never>();

	return eb
		.selectFrom('series_hist')
		.innerJoin('series_title_hist', 'series_title_hist.change_id', 'series_hist.change_id')
		.leftJoin('series_title_hist as series_title_hist_orig', (join) =>
			join
				.onRef('series_title_hist_orig.change_id', '=', 'series_hist.change_id')
				.onRef('series_title_hist_orig.lang', '=', 'series_hist.olang'),
		)
		.distinctOn('series_hist.change_id')
		.select([
			'series_hist.change_id as id',
			'series_hist.bookwalker_id',
			'series_hist.publication_status',
			'series_hist.description',
			'series_hist.aliases',
			'series_hist.anidb_id',
			'series_hist.start_date',
			'series_hist.end_date',
			'series_hist.c_start_date',
			'series_hist.c_end_date',
			'series_hist.c_latest_release_date',
			'series_hist.c_popularity',
			'series_hist.web_novel',
			'series_hist.website',
			'series_hist.wikidata_id',
			'series_hist.anilist_id',
			'series_hist.mal_id',
			'series_hist.olang',
		])
		.select(['series_title_hist.lang', 'series_title_hist.romaji', 'series_title_hist.title'])
		.select([
			'series_title_hist_orig.title as title_orig',
			'series_title_hist_orig.romaji as romaji_orig',
		])
		.orderBy('series_hist.change_id')
		.orderBy('id')
		.orderBy((eb) => titleHistCaseBuilder(eb, langPrios ?? defaultLangPrio));
}

export class DBSeries {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>, user?: User | null) {
		const ranobeDB = new RanobeDB(db, user);
		return new this(ranobeDB);
	}

	getSeries(params?: {
		q?: string | null;
		listStatus?: UserListStatus;
		userId?: string;
		labelIds?: number[];
		isList?: boolean;
	}) {
		let labels = undefined;
		if (params?.labelIds && params?.labelIds.length > 0) {
			labels = params.labelIds;
		}
		const userId = params?.userId;

		return this.ranobeDB.db
			.with('cte_series', () =>
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs)
					.$if(typeof params?.q === 'string', (qb) =>
						qb.where((eb) =>
							eb.or([
								eb(
									'series.id',
									'in',
									eb
										.selectFrom('series_title as st2')
										.select('st2.series_id')
										.where((eb) =>
											eb.or([
												eb(
													eb.val(params?.q),
													sql.raw('<%'),
													eb.ref('st2.title'),
												).$castTo<boolean>(),
												eb(
													eb.val(params?.q),
													sql.raw('<%'),
													eb.ref('st2.romaji'),
												).$castTo<boolean>(),
											]),
										),
								),
								eb.fn<SqlBool>('regexp_like', [
									'series.aliases',
									eb.val(`^${escapeRegex(params?.q)}$`),
									eb.val('im'),
								]),
							]),
						),
					)
					.$if(Boolean(labels) && params?.listStatus === 'Not in my list', (qb) =>
						qb.where((eb) => eb(eb.val(1), '=', eb.val(2))),
					)
					.$if(Boolean(labels) && Boolean(userId), (qb) =>
						qb
							.innerJoin('user_list_series', (join) =>
								join
									.onRef('user_list_series.series_id', '=', 'series.id')
									.on('user_list_series.user_id', '=', userId!),
							)
							.innerJoin('user_list_series_label', (join) =>
								join
									.onRef('user_list_series_label.series_id', '=', 'series.id')
									.onRef('user_list_series_label.user_id', '=', 'user_list_series.user_id'),
							)
							.innerJoin('user_list_label', (join) =>
								join
									.onRef('user_list_label.user_id', '=', 'user_list_series.user_id')
									.onRef('user_list_label.id', '=', 'user_list_series_label.label_id'),
							)
							.where('user_list_label.id', 'in', labels!),
					)
					.$if(params?.listStatus === 'In my list' && !labels && Boolean(userId), (qb) =>
						qb.innerJoin('user_list_series', (join) =>
							join
								.onRef('user_list_series.series_id', '=', 'series.id')
								.on('user_list_series.user_id', '=', userId!),
						),
					)
					.$if(params?.listStatus === 'Not in my list' && !labels && Boolean(userId), (qb) =>
						qb
							.leftJoin('user_list_series', (join) =>
								join
									.onRef('user_list_series.series_id', '=', 'series.id')
									.on('user_list_series.user_id', '=', userId!),
							)
							.where('user_list_series.series_id', 'is', null),
					),
			)
			.selectFrom('cte_series')
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('book')
						.innerJoin('series_book', 'series_book.series_id', 'cte_series.id')
						.select('book.id')
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
						.whereRef('series_book.book_id', '=', 'book.id')
						.where('book.hidden', '=', false)
						.orderBy('series_book.sort_order', 'asc')
						.limit(1),
				).as('book'),
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('series_book as sb3')
						.innerJoin('book', 'book.id', 'sb3.book_id')
						.where('book.hidden', '=', false)
						.whereRef('sb3.series_id', '=', 'cte_series.id')
						.select(({ fn }) => [fn.countAll().as('count')]),
				).as('volumes'),
			])
			.$if(typeof userId === 'string', (qb) =>
				qb.select((eb) => [
					jsonObjectFrom(
						eb
							.selectFrom('series_book as sb3')
							.innerJoin('book', 'book.id', 'sb3.book_id')
							.innerJoin('user_list_book_label', (join) =>
								join
									.onRef('user_list_book_label.book_id', '=', 'book.id')
									.on('user_list_book_label.label_id', '=', 2)
									.on('user_list_book_label.user_id', '=', userId!),
							)
							.where('book.hidden', '=', false)
							.whereRef('sb3.series_id', '=', 'cte_series.id')
							.select(({ fn }) => [fn.countAll().as('count')]),
					).as('c_vols_read'),
					jsonObjectFrom(
						eb
							.selectFrom('user_list_series_label')
							.innerJoin('user_list_label', (join) =>
								join
									.onRef('user_list_series_label.label_id', '=', 'user_list_label.id')
									.onRef('user_list_series_label.user_id', '=', 'user_list_label.user_id')
									.onRef('user_list_series_label.series_id', '=', 'cte_series.id'),
							)
							.select('user_list_label.label')
							.where('user_list_label.user_id', '=', userId!)
							.where('user_list_label.id', '<=', 10)
							.limit(1),
					).as('label'),
					jsonObjectFrom(
						eb
							.selectFrom('user_list_series')
							.select(['user_list_series.volumes_read'])
							.where('user_list_series.user_id', '=', userId!)
							.whereRef('user_list_series.series_id', '=', 'cte_series.id')
							.limit(1),
					).as('vols_read'),
				]),
			)
			.$if(typeof userId === 'string' && Boolean(params?.isList), (qb) =>
				qb
					.innerJoin('user_list_series', (join) =>
						join
							.onRef('user_list_series.series_id', '=', 'cte_series.id')
							.on('user_list_series.user_id', '=', String(userId)),
					)
					.select([
						'user_list_series.added',
						'user_list_series.last_updated',
						'user_list_series.started',
						'user_list_series.finished',
					])
					.select((eb) => eb(eb.cast<string>('score', 'decimal'), '/', '10').as('score')),
			)
			.select([
				'cte_series.id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'cte_series.olang',
				'cte_series.c_num_books',
				'cte_series.c_start_date',
				'cte_series.c_end_date',
			]);
	}

	getSeriesOne(id: number, userId?: string) {
		return this.ranobeDB.db
			.with('cte_book', () =>
				withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs)
					.innerJoin('series_book', 'series_book.book_id', 'book.id')
					.where('series_book.series_id', '=', id),
			)
			.with('cte_series', () =>
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs).where((eb) =>
					eb.or([
						eb('series.id', '=', id),
						eb(
							'series.id',
							'in',
							eb
								.selectFrom('series_relation')
								.innerJoin('series as child_series', 'child_series.id', 'series_relation.id_child')
								.select(['child_series.id'])
								.where('series_relation.id_parent', '=', id)
								.where('child_series.hidden', '=', false),
						),
					]),
				),
			)
			.with('cte_series_2', () => withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs))
			.selectFrom('cte_series')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.c_start_date',
				'cte_series.c_end_date',
				'cte_series.web_novel',
				'cte_series.website',
				'cte_series.wikidata_id',
				'cte_series.anilist_id',
				'cte_series.mal_id',
				'cte_series.olang',
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
						.select(['cte_book.description', 'cte_book.description_ja'])
						.where('cte_book.hidden', '=', false)
						.whereRef('series_book.series_id', '=', 'cte_series.id')
						.orderBy('sort_order', 'asc')
						.limit(1),
				).as('book_description'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'cte_book.lang',
							'cte_book.c_release_date',
							'cte_book.c_release_dates',
							'series_book.sort_order',
							'series_book.book_type',
						])
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'cte_book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
						.$if(typeof userId === 'string', (qb) =>
							qb.select((eb) =>
								jsonObjectFrom(
									eb
										.selectFrom('user_list_book_label')
										.innerJoin('user_list_label', (join) =>
											join
												.onRef('user_list_book_label.label_id', '=', 'user_list_label.id')
												.onRef('user_list_book_label.user_id', '=', 'user_list_label.user_id')
												.onRef('user_list_book_label.book_id', '=', 'cte_book.id'),
										)
										.select('user_list_label.label')
										.where('user_list_label.user_id', '=', String(userId))
										.where('user_list_label.id', '<=', 10)
										.limit(1),
								).as('label'),
							),
						)
						.where('cte_book.hidden', '=', false)
						.whereRef('series_book.series_id', '=', 'cte_series.id')
						.orderBy('sort_order', 'asc'),
				).as('books'),
				jsonObjectFrom(
					eb
						.selectFrom('user_list_series')
						.select((eb) => eb(eb.fn.avg('user_list_series.score'), '/', 10).as('score'))
						.select((eb) => eb.fn.count('user_list_series.series_id').as('count'))
						.whereRef('user_list_series.series_id', '=', 'cte_series.id')
						.where('user_list_series.score', 'is not', null)
						.groupBy('user_list_series.series_id')
						.limit(1),
				).as('rating'),
				jsonObjectFrom(
					eb
						.selectFrom('user_series_review')
						.select((eb) => eb.fn.countAll().as('count'))
						.whereRef('user_series_review.series_id', '=', 'cte_series.id')
						.limit(1),
				).as('num_reviews'),
				jsonArrayFrom(
					eb
						.selectFrom((eb) =>
							eb
								.fn('generate_series', [eb.lit(1), eb.lit(10)])
								.$castTo<{ gs: number }>()
								.as('gs'),
						)
						.leftJoin(
							(eb) =>
								eb
									.selectFrom((eb) =>
										eb
											.selectFrom('user_list_series')
											.select((eb) =>
												eb
													.fn('round', [eb(eb.cast('user_list_series.score', 'decimal'), '/', 10)])
													.as('score'),
											)
											.whereRef('user_list_series.series_id', '=', 'cte_series.id')
											.where('user_list_series.score', 'is not', null)
											.as('scores_rounded'),
									)
									.select('scores_rounded.score')
									.select((eb) => eb.fn.count('scores_rounded.score').as('cnt'))
									.groupBy('scores_rounded.score')
									.as('user_score'),
							(join) => join.onRef('user_score.score', '=', 'gs.gs'),
						)
						.orderBy('gs.gs', 'desc')
						.select('gs.gs')
						.select((eb) => eb.fn.coalesce('user_score.cnt', eb.val('0')).as('count')),
				).as('user_stats_score'),
				jsonArrayFrom(
					eb
						.selectFrom('user_list_series')
						.innerJoin('user_list_series_label', (join) =>
							join
								.onRef('user_list_series.series_id', '=', 'user_list_series_label.series_id')
								.onRef('user_list_series_label.user_id', '=', 'user_list_series.user_id')
								.on('user_list_series_label.label_id', '<', 10),
						)
						.whereRef('user_list_series.series_id', '=', 'cte_series.id')
						.groupBy('user_list_series_label.label_id')
						.select('user_list_series_label.label_id')
						.select((eb) => eb.fn.countAll().as('count')),
				).as('user_stats_label'),
				jsonArrayFrom(
					eb
						.selectFrom('series_title')
						.whereRef('series_title.series_id', '=', 'cte_series.id')
						.select([
							'series_title.title',
							'series_title.romaji',
							'series_title.lang',
							'series_title.official',
						])
						.orderBy('series_title.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation')
						.innerJoin('cte_series as child_series', 'child_series.id', 'series_relation.id_child')
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'child_series.lang',
							'series_relation.relation_type',
						])
						.whereRef('series_relation.id_parent', '=', 'cte_series.id')
						.where('child_series.hidden', '=', false)
						.orderBy('series_relation.relation_type'),
				).as('child_series'),
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.innerJoin('release_book', 'release_book.release_id', 'release_publisher.release_id')
						.innerJoin('release', 'release.id', 'release_book.release_id')
						.innerJoin('series_book', 'series_book.book_id', 'release_book.book_id')
						.innerJoin('book', 'book.id', 'release_book.book_id')
						.distinctOn(['publisher.id', 'release.lang', 'release_publisher.publisher_type'])
						.select([
							'publisher.id',
							'publisher.name',
							'publisher.romaji',
							'release_publisher.publisher_type',
							'release.lang',
						])
						.where('book.hidden', '=', false)
						.where('publisher.hidden', '=', false)
						.where('release.hidden', '=', false)
						.where('series_book.series_id', '=', id)
						.orderBy('release_publisher.publisher_type'),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias')
						.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
						.innerJoin('series_book', 'series_book.book_id', 'book_staff_alias.book_id')
						.innerJoin('book', 'book.id', 'series_book.book_id')
						.innerJoin('book_edition', (join) =>
							join
								.onRef('book_edition.eid', '=', 'book_staff_alias.eid')
								.onRef('book_edition.book_id', '=', 'series_book.book_id'),
						)
						.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
						.distinctOn(['staff_alias.staff_id', 'book_staff_alias.role_type'])
						.select([
							'book_staff_alias.role_type',
							'staff_alias.name',
							'staff_alias.romaji',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias.note',
							'book_edition.lang',
						])
						.where('book.hidden', '=', false)
						.where('staff.hidden', '=', false)
						.where('series_book.series_id', '=', id)
						.orderBy('book_staff_alias.role_type'),
				).as('staff'),
				jsonArrayFrom(
					eb
						.selectFrom('tag')
						.innerJoin('series_tag', 'series_tag.tag_id', 'tag.id')
						.where('series_tag.series_id', '=', id)
						.select(['tag.name', 'tag.ttype', 'tag.id'])
						.orderBy('tag.ttype')
						.orderBy('tag.name'),
				).as('tags'),
			])
			.where('cte_series.id', '=', id);
	}

	getSeriesHistOne(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', () =>
				withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs)
					.innerJoin('series_book_hist', 'series_book_hist.book_id', 'book.id')
					.innerJoin('change', 'change.id', 'series_book_hist.change_id')
					.where('change.item_id', '=', params.id)
					.$if(params.revision !== undefined, (qb) =>
						qb.where('change.revision', '=', params.revision!),
					)
					.$if(params.revision === undefined, (qb) =>
						qb.where((eb) =>
							eb(
								'change.revision',
								'=',
								eb
									.selectFrom('change as c2')
									.where('c2.item_id', '=', params.id)
									.where('c2.item_name', '=', 'series')
									.select('revision')
									.orderBy('revision', 'desc')
									.limit(1),
							),
						),
					),
			)
			.with('cte_series', () =>
				withSeriesHistTitleCte(this.ranobeDB.user?.display_prefs.title_prefs).where((eb) =>
					eb(
						'series_hist.change_id',
						'in',
						eb
							.selectFrom('change')
							.where('change.item_id', '=', params.id)
							.where('change.item_name', '=', 'series')
							.$if(params.revision !== undefined, (qb) =>
								qb.where('change.revision', '=', params.revision!),
							)
							.orderBy('change.revision', 'desc')
							.select('change.id')
							.limit(1),
					),
				),
			)
			.with('cte_series_non_hist', () =>
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs).where((eb) =>
					eb.or([
						eb('series.id', '=', params.id),
						eb(
							'series.id',
							'in',
							eb
								.selectFrom('series_relation_hist')
								.innerJoin('change', 'change.id', 'series_relation_hist.change_id')
								.innerJoin(
									'series as child_series',
									'child_series.id',
									'series_relation_hist.id_child',
								)
								.where('change.item_id', '=', params.id)
								.where('change.item_name', '=', 'series')
								.$if(params.revision !== undefined, (qb) =>
									qb.where('change.revision', '=', params.revision!),
								)
								.$if(params.revision === undefined, (qb) =>
									qb.where((eb) =>
										eb(
											'change.revision',
											'=',
											eb
												.selectFrom('change as c2')
												.where('c2.item_id', '=', params.id)
												.where('c2.item_name', '=', 'series')
												.select('revision')
												.orderBy('revision', 'desc')
												.limit(1),
										),
									),
								)
								.select(['series_relation_hist.id_child'])
								.where('child_series.hidden', '=', false),
						),
					]),
				),
			)
			.selectFrom('cte_series')
			.innerJoin('change', 'change.id', 'cte_series.id')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.c_start_date',
				'cte_series.c_end_date',
				'cte_series.web_novel',
				'cte_series.website',
				'cte_series.wikidata_id',
				'cte_series.anilist_id',
				'cte_series.mal_id',
				'cte_series.olang',
				'change.ilock as locked',
				'change.ihid as hidden',
			])
			.select((eb) => [
				jsonObjectFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'cte_book.id')
						.select(['cte_book.description', 'cte_book.description_ja'])
						.where('cte_book.hidden', '=', false)
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.orderBy('sort_order', 'asc')
						.limit(1),
				).as('book_description'),
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'cte_book.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'cte_book.lang',
							'cte_book.c_release_date',
							'cte_book.c_release_dates',
							'series_book_hist.book_type',
							'series_book_hist.sort_order',
						])
						.select((eb) =>
							jsonObjectFrom(
								eb
									.selectFrom('image')
									.whereRef('image.id', '=', 'cte_book.image_id')
									.selectAll('image')
									.limit(1),
							).as('image'),
						)
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.where('cte_book.hidden', '=', false)
						.orderBy('sort_order', 'asc'),
				).as('books'),
				jsonObjectFrom(
					eb
						.selectFrom('user_list_series')
						.select((eb) => eb(eb.fn.avg('user_list_series.score'), '/', 10).as('score'))
						.select((eb) => eb.fn.count('user_list_series.series_id').as('count'))
						.whereRef('user_list_series.series_id', '=', 'cte_series.id')
						.where('user_list_series.score', 'is not', null)
						.groupBy('user_list_series.series_id')
						.limit(1),
				).as('rating'),
				jsonObjectFrom(
					eb
						.selectFrom('user_series_review')
						.select((eb) => eb.fn.countAll().as('count'))
						.whereRef('user_series_review.series_id', '=', 'cte_series.id')
						.limit(1),
				).as('num_reviews'),
				jsonArrayFrom(
					eb
						.selectFrom((eb) =>
							eb
								.fn('generate_series', [eb.lit(1), eb.lit(10)])
								.$castTo<{ gs: number }>()
								.as('gs'),
						)
						.leftJoin(
							(eb) =>
								eb
									.selectFrom((eb) =>
										eb
											.selectFrom('user_list_series')
											.select((eb) =>
												eb
													.fn('round', [eb(eb.cast('user_list_series.score', 'decimal'), '/', 10)])
													.as('score'),
											)
											.whereRef('user_list_series.series_id', '=', 'cte_series.id')
											.where('user_list_series.score', 'is not', null)
											.as('scores_rounded'),
									)
									.select('scores_rounded.score')
									.select((eb) => eb.fn.count('scores_rounded.score').as('cnt'))
									.groupBy('scores_rounded.score')
									.as('user_score'),
							(join) => join.onRef('user_score.score', '=', 'gs.gs'),
						)
						.orderBy('gs.gs', 'desc')
						.select('gs.gs')
						.select((eb) => eb.fn.coalesce('user_score.cnt', eb.val('0')).as('count')),
				).as('user_stats_score'),
				jsonArrayFrom(
					eb
						.selectFrom('user_list_series')
						.innerJoin('user_list_series_label', (join) =>
							join
								.onRef('user_list_series.series_id', '=', 'user_list_series_label.series_id')
								.onRef('user_list_series_label.user_id', '=', 'user_list_series.user_id')
								.on('user_list_series_label.label_id', '<', 10),
						)
						.whereRef('user_list_series.series_id', '=', 'cte_series.id')
						.groupBy('user_list_series_label.label_id')
						.select('user_list_series_label.label_id')
						.select((eb) => eb.fn.countAll().as('count')),
				).as('user_stats_label'),
				jsonArrayFrom(
					eb
						.selectFrom('series_title_hist')
						.whereRef('series_title_hist.change_id', '=', 'cte_series.id')
						.select([
							'series_title_hist.lang',
							'series_title_hist.official',
							'series_title_hist.title',
							'series_title_hist.romaji',
						])
						.orderBy('series_title_hist.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation_hist')
						.innerJoin(
							'cte_series_non_hist as child_series',
							'child_series.id',
							'series_relation_hist.id_child',
						)
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'child_series.lang',
							'series_relation_hist.relation_type',
						])
						.whereRef('series_relation_hist.change_id', '=', 'change.id')
						.where('child_series.hidden', '=', false)
						.orderBy('series_relation_hist.relation_type'),
				).as('child_series'),
				jsonArrayFrom(
					eb
						.selectFrom('publisher')
						.innerJoin('release_publisher', 'release_publisher.publisher_id', 'publisher.id')
						.innerJoin('release_book', 'release_book.release_id', 'release_publisher.release_id')
						.innerJoin('release', 'release.id', 'release_book.release_id')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'release_book.book_id')
						.innerJoin('book', 'book.id', 'release_book.book_id')
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.distinctOn(['publisher.id', 'release.lang', 'release_publisher.publisher_type'])
						.select([
							'publisher.id',
							'publisher.name',
							'publisher.romaji',
							'release_publisher.publisher_type',
							'release.lang',
						])
						.where('book.hidden', '=', false)
						.where('publisher.hidden', '=', false)
						.where('release.hidden', '=', false)
						.orderBy('release_publisher.publisher_type'),
				).as('publishers'),
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias')
						.innerJoin('book_staff_alias', 'book_staff_alias.staff_alias_id', 'staff_alias.id')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'book_staff_alias.book_id')
						.innerJoin('book', 'book.id', 'series_book_hist.book_id')
						.innerJoin('book_edition', (join) =>
							join
								.onRef('book_edition.eid', '=', 'book_staff_alias.eid')
								.onRef('book_edition.book_id', '=', 'series_book_hist.book_id'),
						)
						.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
						.distinctOn(['staff_alias.staff_id', 'book_staff_alias.role_type'])
						.select([
							'book_staff_alias.role_type',
							'staff_alias.name',
							'staff_alias.romaji',
							'staff_alias.staff_id',
							'staff_alias.id as staff_alias_id',
							'book_staff_alias.note',
							'book_edition.lang',
						])
						.where('book.hidden', '=', false)
						.where('staff.hidden', '=', false)
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.orderBy('book_staff_alias.role_type'),
				).as('staff'),
				jsonArrayFrom(
					eb
						.selectFrom('tag')
						.innerJoin('series_tag_hist', 'series_tag_hist.tag_id', 'tag.id')
						.whereRef('series_tag_hist.change_id', '=', 'cte_series.id')
						.select(['tag.name', 'tag.ttype', 'tag.id'])
						.orderBy('tag.ttype')
						.orderBy('tag.name'),
				).as('tags'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'series');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision', 'desc');
		}
		return query;
	}

	getSeriesOneEdit(id: number) {
		return this.ranobeDB.db
			.with('cte_book', () =>
				withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs)
					.innerJoin('series_book', 'series_book.book_id', 'book.id')
					.where('series_book.series_id', '=', id),
			)
			.with('cte_series', () =>
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs).where((eb) =>
					eb.or([
						eb('series.id', '=', id),
						eb(
							'series.id',
							'in',
							eb
								.selectFrom('series_relation')
								.innerJoin('series as child_series', 'child_series.id', 'series_relation.id_child')
								.select(['child_series.id'])
								.where('series_relation.id_parent', '=', id)
								.where('child_series.hidden', '=', false),
						),
					]),
				),
			)
			.selectFrom('cte_series')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.hidden',
				'cte_series.locked',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.web_novel',
				'cte_series.website',
				'cte_series.wikidata_id',
				'cte_series.anilist_id',
				'cte_series.mal_id',
				'cte_series.olang',
				'cte_series.c_start_date',
				'cte_series.c_end_date',
				'cte_series.c_latest_release_date',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'cte_book.lang',
							'series_book.book_type',
							'series_book.sort_order',
						])
						.where('cte_book.hidden', '=', false)
						.whereRef('series_book.series_id', '=', 'cte_series.id')
						.orderBy('sort_order', 'asc'),
				).as('books'),
				jsonArrayFrom(
					eb
						.selectFrom('series_title')
						.whereRef('series_title.series_id', '=', 'cte_series.id')
						.select([
							'series_title.lang',
							'series_title.official',
							'series_title.title',
							'series_title.romaji',
						])
						.orderBy('series_title.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('series_tag')
						.innerJoin('tag', 'tag.id', 'series_tag.tag_id')
						.whereRef('series_tag.series_id', '=', 'cte_series.id')
						.select(['tag.id', 'tag.name', 'tag.ttype'])
						.orderBy('tag.ttype'),
				).as('tags'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation')
						.innerJoin('cte_series as child_series', 'child_series.id', 'series_relation.id_child')
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'child_series.lang',
							'series_relation.relation_type',
						])
						.whereRef('series_relation.id_parent', '=', 'cte_series.id')
						.where('child_series.hidden', '=', false)
						.orderBy('series_relation.relation_type'),
				).as('child_series'),
			])
			.where('cte_series.id', '=', id);
	}

	getSeriesHistOneEdit(params: { id: number; revision?: number }) {
		let query = this.ranobeDB.db
			.with('cte_book', () =>
				withBookTitleCte(this.ranobeDB.user?.display_prefs.title_prefs)
					.innerJoin('series_book_hist', 'series_book_hist.book_id', 'book.id')
					.innerJoin('change', 'change.id', 'series_book_hist.change_id')
					.where('change.item_id', '=', params.id)
					.$if(params.revision !== undefined, (qb) =>
						qb.where('change.revision', '=', params.revision!),
					)
					.$if(params.revision === undefined, (qb) =>
						qb.where((eb) =>
							eb(
								'change.revision',
								'=',
								eb
									.selectFrom('change as c2')
									.where('c2.item_id', '=', params.id)
									.where('c2.item_name', '=', 'series')
									.select('revision')
									.orderBy('revision', 'desc')
									.limit(1),
							),
						),
					),
			)
			.with('cte_series', () =>
				withSeriesHistTitleCte(this.ranobeDB.user?.display_prefs.title_prefs).where((eb) =>
					eb(
						'series_hist.change_id',
						'in',
						eb
							.selectFrom('change')
							.where('change.item_id', '=', params.id)
							.where('change.item_name', '=', 'series')
							.$if(params.revision !== undefined, (qb) =>
								qb.where('change.revision', '=', params.revision!),
							)
							.orderBy('change.revision', 'desc')
							.select('change.id')
							.limit(1),
					),
				),
			)
			.with('cte_series_non_hist', () =>
				withSeriesTitleCte(this.ranobeDB.user?.display_prefs.title_prefs).where((eb) =>
					eb.or([
						eb('series.id', '=', params.id),
						eb(
							'series.id',
							'in',
							eb
								.selectFrom('series_relation_hist')
								.innerJoin('change', 'change.id', 'series_relation_hist.change_id')
								.innerJoin(
									'series as child_series',
									'child_series.id',
									'series_relation_hist.id_child',
								)
								.where('change.item_id', '=', params.id)
								.where('change.item_name', '=', 'series')
								.$if(params.revision !== undefined, (qb) =>
									qb.where('change.revision', '=', params.revision!),
								)
								.$if(params.revision === undefined, (qb) =>
									qb.where((eb) =>
										eb(
											'change.revision',
											'=',
											eb
												.selectFrom('change as c2')
												.where('c2.item_id', '=', params.id)
												.where('c2.item_name', '=', 'series')
												.select('revision')
												.orderBy('revision', 'desc')
												.limit(1),
										),
									),
								)
								.select(['series_relation_hist.id_child'])
								.where('child_series.hidden', '=', false),
						),
					]),
				),
			)
			.selectFrom('cte_series')
			.innerJoin('change', 'change.id', 'cte_series.id')
			.select([
				'cte_series.id',
				'cte_series.bookwalker_id',
				'cte_series.lang',
				'cte_series.publication_status',
				'cte_series.romaji',
				'cte_series.romaji_orig',
				'cte_series.title',
				'cte_series.title_orig',
				'cte_series.description',
				'cte_series.aliases',
				'cte_series.anidb_id',
				'cte_series.start_date',
				'cte_series.end_date',
				'cte_series.web_novel',
				'cte_series.website',
				'cte_series.wikidata_id',
				'cte_series.anilist_id',
				'cte_series.mal_id',
				'cte_series.olang',
				'cte_series.c_start_date',
				'cte_series.c_end_date',
				'cte_series.c_latest_release_date',
				'change.ihid as hidden',
				'change.ilock as locked',
			])
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom('cte_book')
						.innerJoin('series_book_hist', 'series_book_hist.book_id', 'cte_book.id')
						.select([
							'cte_book.id',
							'cte_book.title',
							'cte_book.title_orig',
							'cte_book.romaji',
							'cte_book.romaji_orig',
							'cte_book.image_id',
							'cte_book.lang',
							'series_book_hist.book_type',
							'series_book_hist.sort_order',
						])
						.whereRef('series_book_hist.change_id', '=', 'cte_series.id')
						.where('cte_book.hidden', '=', false)
						.orderBy('sort_order', 'asc'),
				).as('books'),
				jsonArrayFrom(
					eb
						.selectFrom('series_title_hist')
						.whereRef('series_title_hist.change_id', '=', 'cte_series.id')
						.select([
							'series_title_hist.lang',
							'series_title_hist.official',
							'series_title_hist.title',
							'series_title_hist.romaji',
						])
						.orderBy('series_title_hist.lang'),
				).as('titles'),
				jsonArrayFrom(
					eb
						.selectFrom('series_tag_hist')
						.innerJoin('tag', 'tag.id', 'series_tag_hist.tag_id')
						.whereRef('series_tag_hist.change_id', '=', 'cte_series.id')
						.select(['tag.id', 'tag.name', 'tag.ttype'])
						.orderBy('tag.ttype'),
				).as('tags'),
				jsonArrayFrom(
					eb
						.selectFrom('series_relation_hist')
						.innerJoin(
							'cte_series_non_hist as child_series',
							'child_series.id',
							'series_relation_hist.id_child',
						)
						.select([
							'child_series.id',
							'child_series.title',
							'child_series.romaji',
							'child_series.lang',
							'series_relation_hist.relation_type',
						])
						.where('child_series.hidden', '=', false)
						.whereRef('series_relation_hist.change_id', '=', 'cte_series.id')
						.orderBy('series_relation_hist.relation_type'),
				).as('child_series'),
			])
			.where('change.item_id', '=', params.id)
			.where('change.item_name', '=', 'series');

		if (params.revision) {
			query = query.where('change.revision', '=', params.revision);
		} else {
			query = query.orderBy('change.revision', 'desc');
		}
		return query;
	}
}

export type Series = InferResult<ReturnType<DBSeries['getSeriesOne']>>[number];
export type SeriesEdit = InferResult<ReturnType<DBSeries['getSeriesOneEdit']>>[number];
