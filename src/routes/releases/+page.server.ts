import { db } from '$lib/server/db/db.js';
import { orderNullsLast, paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import {
	pageSchema,
	qSchema,
	releaseFiltersObjSchema,
	releaseFiltersSchema,
} from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, sql, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const form = await superValidate(url, zod(releaseFiltersSchema));

	const dbReleases = DBReleases.fromDB(db, locals.user);

	let query = dbReleases.getReleases().where('release.hidden', '=', false);

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;
	const useReleasePublisherFilters = form.data.p.length > 0;

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

	if (useQuery || useReleaseLangFilters || useReleaseFormatFilters || useReleasePublisherFilters) {
		query = query.withPlugin(new DeduplicateJoinsPlugin());
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
		filtersForm: form,
		filtersFormObj: formObj,
	};
};
