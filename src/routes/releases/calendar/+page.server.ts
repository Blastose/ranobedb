import { DateNumber, DateNumberGenerator } from '$lib/components/form/release/releaseDate.js';
import { groupBy } from '$lib/db/array.js';
import { db } from '$lib/server/db/db.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import {
	pageSchema,
	qSchema,
	releaseFiltersCalendarSchema,
	releaseFiltersObjCalendarSchema,
	userListReleaseSchema,
} from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, sql, type Expression, type SqlBool } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import dayjs from 'dayjs';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const form = await superValidate(url, zod(releaseFiltersCalendarSchema));

	const dbReleases = DBReleases.fromDB(db, locals.user);

	const user = locals.user;

	let query = dbReleases
		.getReleases()
		.clearSelect()
		.selectAll('release')
		.$if(locals.user !== undefined, (qb) =>
			qb.select((eb) =>
				jsonObjectFrom(
					eb
						.selectFrom('user_list_release')
						.whereRef('user_list_release.release_id', '=', 'release.id')
						.where('user_list_release.user_id', '=', locals.user?.id ?? '')
						.select('user_list_release.release_status'),
				).as('user_list_release'),
			),
		)
		.where('release.hidden', '=', false);

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
		zod(releaseFiltersObjCalendarSchema),
	);

	if (
		useQuery ||
		useReleaseLangFilters ||
		useReleaseFormatFilters ||
		useReleasePublisherFilters ||
		useReleaseLabelFilters
	) {
		query = query.withPlugin(new DeduplicateJoinsPlugin());
		if (useQuery) {
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
		if (useReleaseLabelFilters && locals.user) {
			query = query
				.innerJoin('user_list_release', 'user_list_release.release_id', 'release.id')
				.where('user_list_release.user_id', '=', locals.user.id)
				.where('user_list_release.release_status', 'in', form.data.l);
		}
	}

	if (user && form.data.list === 'In my list') {
		query = query.innerJoin('user_list_release', (join) =>
			join
				.onRef('user_list_release.release_id', '=', 'release.id')
				.on('user_list_release.user_id', '=', user.id),
		);
	}

	if (user && form.data.list === 'Not in my list') {
		query = query
			.leftJoin('user_list_release', (join) =>
				join
					.onRef('user_list_release.release_id', '=', 'release.id')
					.on('user_list_release.user_id', '=', user.id),
			)
			.where('user_list_release.release_id', 'is', null);
	}

	if (user && form.data.inUpcoming) {
		query = query
			.innerJoin('release_book', 'release_book.release_id', 'release.id')
			.innerJoin('series_book', 'series_book.book_id', 'release_book.book_id')
			.innerJoin('user_list_series', 'user_list_series.series_id', 'series_book.series_id')
			.innerJoin('series', 'series.id', 'series_book.series_id')
			.innerJoin('book', 'book.id', 'release_book.book_id')
			.where('release.hidden', '=', false)
			.where('book.hidden', '=', false)
			.where('series.hidden', '=', false)
			.where('user_list_series.user_id', '=', user.id)
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

	const year = form.data.date[0];
	const month = form.data.date[1];

	query = query.where(
		'release.release_date',
		'>=',
		DateNumberGenerator.fromYearAndMonth(year, month, 'start').date,
	);
	query = query.where(
		'release.release_date',
		'<=',
		DateNumberGenerator.fromYearAndMonth(year, month, 'end').date,
	);

	query = query
		.clearOrderBy()
		.orderBy('release_date asc')
		.orderBy((eb) => sql`${eb.fn.coalesce('release.romaji', 'release.title')} COLLATE numeric asc`);

	const releases = await query.execute();

	const groupedReleases = groupBy(releases, (v) => {
		const dateNumber = new DateNumber(v.release_date);
		const month = dateNumber.getMonth();
		const year = dateNumber.getYear();
		return `${month}|${year}`;
	});

	const userListReleaseForm = await superValidate(zod(userListReleaseSchema));

	const d = dayjs(new Date(year, month - 1, 1));

	const nextMonth = d.add(1, 'month').format('YYYY-MM');
	const prevMonth = d.subtract(1, 'month').format('YYYY-MM');
	const currentMonth = d.format('YYYY-MM');

	return {
		groupedReleases,
		currentPage,
		filtersFormObj: formObj,
		userListReleaseForm,
		nextMonth,
		prevMonth,
		currentMonth,
		month,
		year,
		count: releases.length,
	};
};
