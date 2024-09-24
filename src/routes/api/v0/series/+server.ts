import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema, qSchema, seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, sql, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

async function get(params: { url: URL; locals: App.Locals }) {
	const { url, locals } = params;
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const dbSeries = DBSeries.fromDB(db, locals.user);

	const form = await superValidate(url, zod(seriesFiltersSchema));

	let query = dbSeries.getSeries({ q }).where('cte_series.hidden', '=', false);

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;
	const useStaffFilters = form.data.staff.length > 0;
	const useTagsFilters = form.data.tagsInclude.length + form.data.tagsExclude.length > 0;
	const usePublisherFilters = form.data.p.length > 0;
	const useStatusFilters = form.data.pubStatus.length > 0;

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_series.romaji', 'cte_series.title')} COLLATE numeric asc`,
		);
	} else if (sort === 'Title desc') {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_series.romaji', 'cte_series.title')} COLLATE numeric desc`,
		);
	} else if (sort === 'Start date asc') {
		query = query.orderBy('cte_series.start_date asc');
	} else if (sort === 'Start date desc') {
		query = query.orderBy('cte_series.start_date desc');
	} else if (sort === 'Num. books asc') {
		query = query.orderBy('cte_series.c_num_books asc');
	} else if (sort === 'Num. books desc') {
		query = query.orderBy('cte_series.c_num_books desc');
	} else if (sort.startsWith('Relevance') && useQuery) {
		const orderByDirection = sort.split(' ').slice(-1)[0] as 'asc' | 'desc';
		query = query
			.innerJoin('series_title', 'series_title.series_id', 'cte_series.id')
			.select((eb) =>
				eb.fn
					.max(
						eb.fn('greatest', [
							eb.fn('word_similarity', [eb.val(q), eb.ref('series_title.title')]),
							eb.fn('word_similarity', [eb.val(q), eb.ref('series_title.romaji')]),
						]),
					)
					.as('sim_score'),
			)
			.orderBy(`sim_score ${orderByDirection}`)
			.orderBy(
				(eb) => sql`${eb.fn.coalesce('cte_series.romaji', 'cte_series.title')} COLLATE numeric asc`,
			)
			.groupBy([
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
			]);
	}

	if (
		(sort !== 'Title asc' && sort !== 'Title desc') ||
		(sort.startsWith('Relevance') && !useQuery)
	) {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_series.romaji', 'cte_series.title')} COLLATE numeric asc`,
		);
	}

	if (useStatusFilters) {
		query = query.where('cte_series.publication_status', 'in', form.data.pubStatus);
	}

	if (
		useReleaseFormatFilters ||
		useReleaseLangFilters ||
		useStaffFilters ||
		useTagsFilters ||
		usePublisherFilters
	) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb('cte_series.id', 'in', (eb) =>
				eb
					.selectFrom('series')
					.distinctOn('series.id')
					.select('series.id')
					.innerJoin('series_book', 'series_book.series_id', 'series.id')
					.$if(useReleaseLangFilters, (qb) =>
						qb
							.innerJoin('release_book', (join) =>
								join.onRef('release_book.book_id', '=', 'series_book.book_id'),
							)
							.innerJoin('release', (join) =>
								join.onRef('release.id', '=', 'release_book.release_id'),
							)
							.$if(form.data.rll === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const lang of form.data.rl) {
										filters.push(eb2('release.lang', '=', lang));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.rll === 'and', (qb2) =>
								qb2
									.where('release.lang', 'in', form.data.rl)
									.groupBy('series.id')
									.having((eb) => eb.fn.count('release.lang').distinct(), '=', form.data.rl.length),
							),
					)
					.$if(useReleaseFormatFilters, (qb) =>
						qb
							.innerJoin('release_book', (join) =>
								join.onRef('release_book.book_id', '=', 'series_book.book_id'),
							)
							.innerJoin('release', (join) =>
								join.onRef('release.id', '=', 'release_book.release_id'),
							)
							.$if(form.data.rfl === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const format of form.data.rf) {
										filters.push(eb2('release.format', '=', format));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.rfl === 'and', (qb2) =>
								qb2
									.where('release.format', 'in', form.data.rf)
									.groupBy('series.id')
									.having(
										(eb) => eb.fn.count('release.format').distinct(),
										'=',
										form.data.rf.length,
									),
							),
					)
					.$if(useTagsFilters, (qb) => {
						let rqb = qb
							.innerJoin('series_tag', 'series_tag.series_id', 'series.id')
							.$if(form.data.tagsInclude.length > 0, (qb2) =>
								qb2
									.$if(form.data.til === 'or', (qb3) =>
										qb3.where((eb2) => {
											const filters: Expression<SqlBool>[] = [];
											for (const tag of form.data.tagsInclude) {
												filters.push(eb2('series_tag.tag_id', '=', tag));
											}
											return eb2.or(filters);
										}),
									)
									.$if(form.data.til === 'and', (qb3) =>
										qb3
											.where('series_tag.tag_id', 'in', [
												...form.data.tagsInclude,
												...form.data.tagsExclude,
											])
											.having(
												(eb) => eb.fn.count('series_tag.tag_id').distinct(),
												'=',
												form.data.tagsInclude.length,
											),
									),
							)
							.groupBy('series.id');
						if (form.data.tagsExclude.length > 0) {
							if (form.data.tel === 'or') {
								for (const tagExcl of form.data.tagsExclude) {
									rqb = rqb.having(
										(eb) =>
											eb.fn
												.count((eb2) =>
													eb2
														.case()
														.when('series_tag.tag_id', '=', tagExcl)
														.then('series_tag.tag_id')
														.end(),
												)
												.distinct(),
										'=',
										0,
									);
								}
							}
						}
						return rqb;
					})
					.$if(useStaffFilters, (qb) =>
						qb
							.innerJoin('book_staff_alias', (join) =>
								join.onRef('book_staff_alias.book_id', '=', 'series_book.book_id'),
							)
							.$if(form.data.sl === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const aid of form.data.staff) {
										filters.push(eb2('book_staff_alias.staff_alias_id', '=', aid));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.sl === 'and', (qb2) =>
								qb2
									.where('book_staff_alias.staff_alias_id', 'in', form.data.staff)
									.groupBy('series.id')
									.having(
										(eb) => eb.fn.count('book_staff_alias.staff_alias_id').distinct(),
										'=',
										form.data.staff.length,
									),
							),
					)
					.$if(usePublisherFilters, (qb) =>
						qb
							.innerJoin('series_book', 'series_book.series_id', 'series.id')
							.innerJoin('book_staff_alias', (join) =>
								join.onRef('book_staff_alias.book_id', '=', 'series_book.book_id'),
							)
							.innerJoin('release_book', (join) =>
								join.onRef('release_book.book_id', '=', 'series_book.book_id'),
							)
							.innerJoin('release', (join) =>
								join.onRef('release.id', '=', 'release_book.release_id'),
							)
							.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
							.$if(form.data.pl === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const publisher_id of form.data.p) {
										filters.push(eb2('release_publisher.publisher_id', '=', publisher_id));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.pl === 'and', (qb2) =>
								qb2
									.where('release_publisher.publisher_id', 'in', form.data.p)
									.groupBy('series.id')
									.having(
										(eb) => eb.fn.count('release_publisher.publisher_id').distinct(),
										'=',
										form.data.p.length,
									),
							),
					),
			),
		);
	}

	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: form.data.limit,
		page: currentPage,
	});

	return {
		series,
		count,
		currentPage,
		totalPages,
	};
}

export type SeriesApi = Awaited<ReturnType<typeof get>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await get({ url, locals }));
};
