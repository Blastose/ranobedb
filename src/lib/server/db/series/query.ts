import {
	listLabelsSchema,
	seriesFiltersObjSchema,
	seriesFiltersSchema,
} from '$lib/server/zod/schema';
import { superValidate, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { DBSeries } from './series';
import { DeduplicateJoinsPlugin, sql, type Expression, type Kysely, type SqlBool } from 'kysely';
import type { DB } from '../dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { zod } from 'sveltekit-superforms/adapters';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';
import { getUserSeriesLabels } from '../user/series-list';
import { dateStringToNumber } from '$lib/components/form/release/releaseDate';

export async function getSeries(params: {
	currentPage: number;
	q: string | undefined | null;
	limit: number;
	db: Kysely<DB>;
	listUser: Pick<User, 'id'> | null;
	currentUser: User | null;
	url: URL;
	form: SuperValidated<Infer<typeof seriesFiltersSchema>>;
	isList?: boolean;
}) {
	const { currentPage, q, db, listUser, currentUser, url, form, limit, isList } = params;

	const dbSeries = DBSeries.fromDB(db, currentUser);

	const listLabels = await superValidate(url, zod(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : undefined;

	let query = dbSeries
		.getSeries({ q, listStatus: form.data.list, userId: listUser?.id, labelIds: labels, isList })
		.where('cte_series.hidden', '=', false);
	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseLangExcludeFilters = form.data.rlExclude.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;
	const useStaffFilters = form.data.staff.length > 0;
	const useTagsFilters = form.data.tagsInclude.length + form.data.tagsExclude.length > 0;
	const usePublisherFilters = form.data.p.length > 0;
	const useStatusFilters = form.data.pubStatus.length > 0;

	const genres = await db
		.selectFrom('tag')
		.where('tag.ttype', '=', 'genre')
		.select(['tag.id', 'tag.name', 'tag.ttype'])
		.orderBy('tag.name')
		.execute();

	const formSelectedTags: { id: number; mode: 'incl' | 'excl' }[] = [
		...form.data.tagsInclude.map((v) => ({ id: v, mode: 'incl' as const })),
		...form.data.tagsExclude.map((v) => ({ id: v, mode: 'excl' as const })),
	];

	const selectedGenresWithMode = genres.map((v) => ({
		...v,
		mode: formSelectedTags.find((vv) => vv.id === v.id)?.mode ?? ('none' as const),
	}));

	const selectedTags =
		formSelectedTags.length > 0
			? await db
					.selectFrom('tag')
					.where('tag.ttype', '!=', 'genre')
					.where(
						'tag.id',
						'in',
						formSelectedTags.map((v) => v.id),
					)
					.select(['tag.id', 'tag.name', 'tag.ttype'])
					.execute()
			: [];

	const selectedTagsWithMode = selectedTags.map((v) => ({
		...v,
		mode: formSelectedTags.find((vv) => vv.id === v.id)?.mode ?? 'incl',
	}));

	const [staff_aliases, publishers, staff_ids] = await Promise.all([
		await db
			.selectFrom('staff_alias')
			.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
			.where('staff.hidden', '=', false)
			.where('staff_alias.id', 'in', form.data.staff.length > 0 ? form.data.staff : [-1])
			.select(['staff_alias.id', 'staff_alias.name', 'staff_alias.romaji'])
			.execute(),
		await db
			.selectFrom('publisher')
			.where('publisher.hidden', '=', false)
			.where('publisher.id', 'in', form.data.p.length > 0 ? form.data.p : [-1])
			.select(['publisher.id', 'publisher.name', 'publisher.romaji'])
			.execute(),
		await db
			.selectFrom('staff')
			.innerJoin('staff_alias', 'staff_alias.staff_id', 'staff.id')
			.where('staff_alias.id', 'in', form.data.staff.length > 0 ? form.data.staff : [-1])
			.groupBy('staff.id')
			.select('staff.id')
			.execute(),
	]);

	staff_aliases.sort((a, b) => form.data.staff.indexOf(a.id) - form.data.staff.indexOf(b.id));
	publishers.sort((a, b) => form.data.p.indexOf(a.id) - form.data.p.indexOf(b.id));

	const formObj = await superValidate(
		{ ...form.data, tags: selectedTagsWithMode, staff: staff_aliases, p: publishers },
		zod(seriesFiltersObjSchema),
	);

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy(
			(eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'),
			(ob) => ob.collate('numeric').asc(),
		);
	} else if (sort === 'Title desc') {
		query = query.orderBy(
			(eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'),
			(ob) => ob.collate('numeric').desc(),
		);
	} else if (sort === 'Start date asc') {
		query = query.orderBy('cte_series.start_date', 'asc');
	} else if (sort === 'Start date desc') {
		query = query.orderBy('cte_series.start_date', 'desc');
	} else if (sort === 'Num. books asc') {
		query = query.orderBy('cte_series.c_num_books', 'asc');
	} else if (sort === 'Num. books desc') {
		query = query.orderBy('cte_series.c_num_books', 'desc');
	} else if (sort === 'Score asc' && listUser !== null) {
		query = query.orderBy('score', 'asc');
	} else if (sort === 'Score desc' && listUser !== null) {
		query = query.orderBy('score', (ob) => ob.desc().nullsLast());
	} else if (sort === 'Added asc' && listUser !== null) {
		query = query.orderBy('added', 'asc');
	} else if (sort === 'Added desc' && listUser !== null) {
		query = query.orderBy('added', 'desc');
	} else if (sort === 'Last updated asc' && listUser !== null) {
		query = query.orderBy('last_updated', 'asc');
	} else if (sort === 'Last updated desc' && listUser !== null) {
		query = query.orderBy('last_updated', 'desc');
	} else if (sort === 'Started asc' && listUser !== null) {
		query = query.orderBy('started', (ob) => ob.asc().nullsLast());
	} else if (sort === 'Started desc' && listUser !== null) {
		query = query.orderBy('started', (ob) => ob.desc().nullsLast());
	} else if (sort === 'Finished asc' && listUser !== null) {
		query = query.orderBy('finished', (ob) => ob.asc().nullsLast());
	} else if (sort === 'Finished desc' && listUser !== null) {
		query = query.orderBy('finished', (ob) => ob.desc().nullsLast());
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
			.orderBy('sim_score', orderByDirection)
			.orderBy(
				(eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'),
				(ob) => ob.collate('numeric').asc(),
			);

		if (isList) {
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
				'cte_series.c_start_date',
				'cte_series.c_end_date',
				'score',
				'last_updated',
				'added',
			]);
		} else {
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
				'cte_series.c_start_date',
				'cte_series.c_end_date',
			]);
		}
	}

	if (
		(sort !== 'Title asc' && sort !== 'Title desc') ||
		(sort.startsWith('Relevance') && !useQuery)
	) {
		query = query.orderBy(
			(eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'),
			(ob) => ob.collate('numeric').asc(),
		);
	}

	if (useStatusFilters) {
		query = query.where('cte_series.publication_status', 'in', form.data.pubStatus);
	}

	if (
		useReleaseFormatFilters ||
		useReleaseLangExcludeFilters ||
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
					.$if(useReleaseLangExcludeFilters, (qb) => {
						let ex_qb = qb
							.innerJoin('release_book as rb_ex', 'rb_ex.book_id', 'series_book.book_id')
							.innerJoin('release as r_ex', 'r_ex.id', 'rb_ex.release_id')
							.groupBy('series.id');
						for (const ex_lang of form.data.rlExclude) {
							ex_qb = ex_qb.having(
								(eb) =>
									eb.fn
										.count((eb2) => eb2.case().when('r_ex.lang', '=', ex_lang).then(1).end())
										.distinct(),
								'=',
								0,
							);
						}
						return ex_qb;
					})
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
							.innerJoin('staff_alias', 'staff_alias.id', 'book_staff_alias.staff_alias_id')
							.$if(form.data.sl === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const staff of staff_ids) {
										filters.push(eb2('staff_alias.staff_id', '=', staff.id));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.sl === 'and', (qb2) =>
								qb2
									.where(
										'staff_alias.staff_id',
										'in',
										staff_ids.map((v) => v.id),
									)
									.groupBy('series.id')
									.having(
										(eb) => eb.fn.count('staff_alias.staff_id').distinct(),
										'=',
										staff_ids.length,
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

	if (form.data.minVolumes) {
		query = query.where('cte_series.c_num_books', '>=', form.data.minVolumes);
	}
	if (form.data.maxVolumes) {
		query = query.where('cte_series.c_num_books', '<=', form.data.maxVolumes);
	}

	if (form.data.minStartDate) {
		query = query.where(
			'cte_series.c_start_date',
			'>=',
			dateStringToNumber(form.data.minStartDate),
		);
	}
	if (form.data.maxStartDate) {
		query = query.where(
			'cte_series.c_start_date',
			'<=',
			dateStringToNumber(form.data.maxStartDate),
		);
	}
	if (form.data.minEndDate) {
		query = query.where('cte_series.c_end_date', '>=', dateStringToNumber(form.data.minEndDate));
	}
	if (form.data.maxEndDate) {
		query = query.where('cte_series.c_end_date', '<=', dateStringToNumber(form.data.maxEndDate));
	}

	const {
		result: series,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: limit,
		page: currentPage,
	});

	const allCustLabels = listUser ? await getUserSeriesLabels(listUser.id, true) : [];

	return {
		series,
		count,
		currentPage,
		totalPages,
		filtersFormObj: formObj,
		genres: selectedGenresWithMode,
		allCustLabels,
	};
}
