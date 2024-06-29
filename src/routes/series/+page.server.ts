import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { pageSchema, qSchema, seriesFiltersSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, type Expression, type SqlBool } from 'kysely';
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

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy((eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'), 'asc');
	} else if (sort === 'Title desc') {
		query = query.orderBy((eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'), 'desc');
	} else if (sort === 'Start date asc') {
		query = query.orderBy('cte_series.start_date asc');
	} else if (sort === 'Start date desc') {
		query = query.orderBy('cte_series.start_date desc');
	} else if (sort === 'Num. books asc') {
		query = query.orderBy('cte_series.c_num_books asc');
	} else if (sort === 'Num. books desc') {
		query = query.orderBy('cte_series.c_num_books desc');
	}

	if (sort !== 'Title asc' && sort !== 'Title desc') {
		query = query.orderBy((eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'), 'asc');
	}

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;

	if (useQuery || useReleaseFormatFilters || useReleaseLangFilters) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb('cte_series.id', 'in', (eb) =>
				eb
					.selectFrom('series')
					.$if(useQuery, (qb) =>
						qb
							.innerJoin('series_title', (join) =>
								join.onRef('series_title.series_id', '=', 'series.id'),
							)
							.where((eb2) =>
								eb2.or([
									eb2('series_title.title', 'ilike', `%${q}%`),
									eb2('series_title.romaji', 'ilike', `%${q}%`),
								]),
							),
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
									.groupBy('series_book.series_id')
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
							.$if(form.data.rll === 'or', (qb2) =>
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
									.groupBy('series_book.series_id')
									.having(
										(eb) => eb.fn.count('release.format').distinct(),
										'=',
										form.data.rf.length,
									),
							),
					)
					.select('series.id'),
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
