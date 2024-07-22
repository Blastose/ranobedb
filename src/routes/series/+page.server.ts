import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema, qSchema, seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, sql, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const dbSeries = DBSeries.fromDB(db, locals.user);

	const form = await superValidate(url, zod(seriesFiltersSchema));

	let query = dbSeries.getSeries().where('cte_series.hidden', '=', false);

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;
	const useStaffFilters = form.data.staff.length > 0;

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
							eb.fn('strict_word_similarity', [eb.val(q), eb.ref('series_title.title')]),
							eb.fn('strict_word_similarity', [eb.val(q), eb.ref('series_title.romaji')]),
							eb.fn('strict_word_similarity', [eb.val(q), eb.ref('cte_series.aliases')]),
						]),
					)
					.as('sim_score'),
			)
			.where((eb) =>
				eb.or([
					eb(eb.val(q), sql.raw('<<%'), eb.ref('series_title.title')).$castTo<boolean>(),
					eb(eb.val(q), sql.raw('<<%'), eb.ref('series_title.romaji')).$castTo<boolean>(),
				]),
			)
			.having(
				(eb) =>
					eb.fn.max(
						eb.fn('greatest', [
							eb.fn('strict_word_similarity', [eb.val(q), eb.ref('series_title.title')]),
							eb.fn('strict_word_similarity', [eb.val(q), eb.ref('series_title.romaji')]),
							eb.fn('strict_word_similarity', [eb.val(q), eb.ref('cte_series.aliases')]),
						]),
					),
				'>',
				0.3,
			)
			.orderBy(`sim_score ${orderByDirection}`)
			.orderBy(
				(eb) => sql`${eb.fn.coalesce('cte_series.romaji', 'cte_series.title')} COLLATE numeric asc`,
			);
		query = query.groupBy([
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

	if (useQuery || useReleaseFormatFilters || useReleaseLangFilters || useStaffFilters) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb('cte_series.id', 'in', (eb) =>
				eb
					.selectFrom('series')
					.distinctOn('series.id')
					.select('series.id')
					.$if(useQuery && !sort.startsWith('Relevance'), (qb) =>
						qb
							.innerJoin('series_title', (join) =>
								join.onRef('series_title.series_id', '=', 'series.id'),
							)
							.where((eb) =>
								eb.or([
									eb(eb.val(q), sql.raw('<<%'), eb.ref('series_title.title')).$castTo<boolean>(),
									eb(eb.val(q), sql.raw('<<%'), eb.ref('series_title.romaji')).$castTo<boolean>(),
								]),
							)
							.having(
								(eb) =>
									eb.fn.max(
										eb.fn('greatest', [
											eb.fn('strict_word_similarity', [eb.val(q), eb.ref('series_title.title')]),
											eb.fn('strict_word_similarity', [eb.val(q), eb.ref('series_title.romaji')]),
										]),
									),
								'>',
								0.3,
							)
							.groupBy('series.id'),
					)
					.$if(useReleaseLangFilters, (qb) =>
						qb
							.innerJoin('series_book', 'series_book.series_id', 'series.id')
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
							.innerJoin('series_book', 'series_book.series_id', 'series.id')
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
					.$if(useStaffFilters, (qb) =>
						qb
							.innerJoin('series_book', 'series_book.series_id', 'series.id')
							.innerJoin('release_book', (join) =>
								join.onRef('release_book.book_id', '=', 'series_book.book_id'),
							)
							.innerJoin('book_staff_alias', 'book_staff_alias.book_id', 'release_book.book_id')
							.where((eb2) => {
								const filters: Expression<SqlBool>[] = [];
								for (const staff of form.data.staff) {
									filters.push(eb2('book_staff_alias.staff_alias_id', '=', staff));
								}
								return eb2.or(filters);
							}),
					),
			),
		);
	}

	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		series,
		count,
		currentPage,
		totalPages,
		filtersForm: form,
	};
};
