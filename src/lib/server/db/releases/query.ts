import { releaseFiltersObjSchema, releaseFiltersSchema } from '$lib/server/zod/schema';
import { superValidate, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { DBReleases } from './releases';
import { DeduplicateJoinsPlugin, sql, type Expression, type Kysely, type SqlBool } from 'kysely';
import type { DB } from '../dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { orderNullsLast, paginationBuilderExecuteWithCount } from '../dbHelpers';
import { zod } from 'sveltekit-superforms/adapters';

export async function getReleases(params: {
	currentPage: number;
	q: string | undefined | null;
	db: Kysely<DB>;
	listUser: Pick<User, 'id'> | null;
	currentUser: User | null;
	url: URL;
	form: SuperValidated<Infer<typeof releaseFiltersSchema>>;
}) {
	const { currentPage, q, db, listUser, currentUser, form } = params;

	const dbReleases = DBReleases.fromDB(db, currentUser);

	let query = dbReleases.getReleasesWithImage().where('release.hidden', '=', false);

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;
	const useReleasePublisherFilters = form.data.p.length > 0;
	const useReleaseLabelFilters = form.data.l.length > 0;

	const [publishers] = await Promise.all([
		await db
			.selectFrom('publisher')
			.where('publisher.hidden', '=', false)
			.where('publisher.id', 'in', form.data.p.length > 0 ? form.data.p : [-1])
			.select(['publisher.id', 'publisher.name', 'publisher.romaji'])
			.execute(),
	]);

	publishers.sort((a, b) => form.data.p.indexOf(a.id) - form.data.p.indexOf(b.id));

	const formObj = await superValidate(
		{ ...form.data, p: publishers },
		zod(releaseFiltersObjSchema),
	);

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('release.romaji', 'release.title')} COLLATE numeric asc`,
		);
	} else if (sort === 'Title desc') {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('release.romaji', 'release.title')} COLLATE numeric desc`,
		);
	} else if (sort === 'Release date asc') {
		query = query.orderBy('release.release_date asc');
	} else if (sort === 'Release date desc') {
		query = query.orderBy('release.release_date desc');
	} else if (sort === 'Pages asc') {
		query = query.orderBy('release.pages', 'asc');
	} else if (sort === 'Pages desc') {
		query = query.orderBy('release.pages', orderNullsLast('desc'));
	} else if (sort.startsWith('Relevance') && useQuery) {
		const orderByDirection = sort.split(' ').slice(-1)[0] as 'asc' | 'desc';
		query = query
			.select((eb) =>
				eb
					.fn('greatest', [
						eb.fn('word_similarity', [eb.val(q), eb.ref('release.title')]),
						eb.fn('word_similarity', [eb.val(q), eb.ref('release.romaji')]),
					])
					.as('sim_score'),
			)
			.where((eb) =>
				eb.or([
					eb(eb.val(q), sql.raw('<%'), eb.ref('release.title')).$castTo<boolean>(),
					eb(eb.val(q), sql.raw('<%'), eb.ref('release.romaji')).$castTo<boolean>(),
				]),
			)
			.where(
				(eb) =>
					eb.fn('greatest', [
						eb.fn('word_similarity', [eb.val(q), eb.ref('release.title')]),
						eb.fn('word_similarity', [eb.val(q), eb.ref('release.romaji')]),
					]),

				'>',
				0.3,
			)
			.orderBy(`sim_score ${orderByDirection}`)
			.orderBy(
				(eb) => sql`${eb.fn.coalesce('release.romaji', 'release.title')} COLLATE numeric asc`,
			);
	}

	if (
		(sort !== 'Title asc' && sort !== 'Title desc') ||
		(sort.startsWith('Relevance') && !useQuery)
	) {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('release.romaji', 'release.title')} COLLATE numeric asc`,
		);
	}

	query = query.withPlugin(new DeduplicateJoinsPlugin());
	if (
		useQuery ||
		useReleaseLangFilters ||
		useReleaseFormatFilters ||
		useReleasePublisherFilters ||
		useReleaseLabelFilters
	) {
		if (useQuery && !sort.startsWith('Relevance')) {
			query = query
				.where((eb) =>
					eb.or([
						eb(eb.val(q), sql.raw('<%'), eb.ref('release.title')).$castTo<boolean>(),
						eb(eb.val(q), sql.raw('<%'), eb.ref('release.romaji')).$castTo<boolean>(),
					]),
				)
				.where(
					(eb) =>
						eb.fn('greatest', [
							eb.fn('word_similarity', [eb.val(q), eb.ref('release.title')]),
							eb.fn('word_similarity', [eb.val(q), eb.ref('release.romaji')]),
						]),
					'>',
					0.3,
				);
		}
		if (useReleaseLangFilters) {
			query = query.where((eb) => {
				const filters: Expression<SqlBool>[] = [];
				for (const lang of form.data.rl) {
					filters.push(eb('release.lang', '=', lang));
				}
				return eb.or(filters);
			});
		}
		if (useReleaseFormatFilters) {
			query = query.where((eb) => {
				const filters: Expression<SqlBool>[] = [];
				for (const format of form.data.rf) {
					filters.push(eb('release.format', '=', format));
				}
				return eb.or(filters);
			});
		}
		if (useReleasePublisherFilters) {
			query = query
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
						.groupBy('release.id')
						.having(
							(eb) => eb.fn.count('release_publisher.publisher_id').distinct(),
							'=',
							form.data.p.length,
						),
				);
		}
		// Potential duplicate joins on 'user_list_release', so we check to make sure we don't include this
		if (useReleaseLabelFilters && listUser && form.data.list !== 'Not in my list') {
			query = query
				.innerJoin('user_list_release', 'user_list_release.release_id', 'release.id')
				.where('user_list_release.user_id', '=', listUser.id)
				.where('user_list_release.release_status', 'in', form.data.l);
		}
	}

	// Potential duplicate joins on 'user_list_release', so we check to make sure we don't include this
	if (listUser && form.data.list === 'In my list' && !useReleaseLabelFilters) {
		query = query.innerJoin('user_list_release', (join) =>
			join
				.onRef('user_list_release.release_id', '=', 'release.id')
				.on('user_list_release.user_id', '=', listUser.id),
		);
	}

	if (listUser && form.data.list === 'Not in my list') {
		query = query
			.leftJoin('user_list_release', (join) =>
				join
					.onRef('user_list_release.release_id', '=', 'release.id')
					.on('user_list_release.user_id', '=', listUser.id),
			)
			.where('user_list_release.release_id', 'is', null);
	}

	// HACK?
	// If this is true, then there are no results
	if (listUser && form.data.list === 'Not in my list' && useReleaseLabelFilters) {
		query = query.where('release.id', '=', -1);
	}

	if (listUser && form.data.inUpcoming) {
		query = query
			.innerJoin('release_book', 'release_book.release_id', 'release.id')
			.innerJoin('series_book', 'series_book.book_id', 'release_book.book_id')
			.innerJoin('user_list_series', 'user_list_series.series_id', 'series_book.series_id')
			.innerJoin('series', 'series.id', 'series_book.series_id')
			.innerJoin('book', 'book.id', 'release_book.book_id')
			.where('release.hidden', '=', false)
			.where('book.hidden', '=', false)
			.where('series.hidden', '=', false)
			.where('user_list_series.user_id', '=', listUser.id)
			.where('user_list_series.show_upcoming', '=', true)
			.where((eb) =>
				eb.and([
					eb.or([
						eb(
							'release.lang',
							'in',
							eb
								.selectFrom('user_list_series_lang')
								.whereRef('user_list_series_lang.user_id', '=', 'user_list_series.user_id')
								.whereRef('user_list_series_lang.series_id', '=', 'user_list_series.series_id')
								.select('user_list_series_lang.lang'),
						),
						eb(
							eb
								.selectFrom('user_list_series_lang')
								.whereRef('user_list_series_lang.user_id', '=', 'user_list_series.user_id')
								.whereRef('user_list_series_lang.series_id', '=', 'user_list_series.series_id')
								.select((eb) => eb.fn.count('user_list_series_lang.lang').as('count')),
							'=',
							0,
						),
					]),
					eb.or([
						eb(
							'release.format',
							'in',
							eb
								.selectFrom('user_list_series_format')
								.whereRef('user_list_series_format.user_id', '=', 'user_list_series.user_id')
								.whereRef('user_list_series_format.series_id', '=', 'user_list_series.series_id')
								.select('user_list_series_format.format'),
						),
						eb(
							eb
								.selectFrom('user_list_series_format')
								.whereRef('user_list_series_format.user_id', '=', 'user_list_series.user_id')
								.whereRef('user_list_series_format.series_id', '=', 'user_list_series.series_id')
								.select((eb) => eb.fn.count('user_list_series_format.format').as('count')),
							'=',
							0,
						),
					]),
				]),
			);
	}

	const {
		result: releases,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		releases,
		count,
		currentPage,
		totalPages,
		filtersFormObj: formObj,
	};
}
