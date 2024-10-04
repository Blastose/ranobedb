import {
	DateNumber,
	DateNumberGenerator,
	getTodayAsDateNumber,
} from '$lib/components/form/release/releaseDate.js';
import { groupBy } from '$lib/db/array.js';
import { db } from '$lib/server/db/db';
import { DBUsers } from '$lib/server/db/user/user.js';
import {
	releaseFiltersObjCalendarSchema,
	releaseFiltersSchema,
	userListReleaseSchema,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import type { Expression, SqlBool } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const form = await superValidate(url, zod(releaseFiltersSchema));
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
		zod(releaseFiltersObjCalendarSchema),
	);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const isMyList = user?.id_numeric === userIdNumeric;

	let query = db
		.selectFrom('release')
		.innerJoin('release_book', 'release_book.release_id', 'release.id')
		.innerJoin('series_book', 'series_book.book_id', 'release_book.book_id')
		.innerJoin('user_list_series', 'user_list_series.series_id', 'series_book.series_id')
		.innerJoin('series', 'series.id', 'series_book.series_id')
		.innerJoin('book', 'book.id', 'release_book.book_id')
		.where('release.hidden', '=', false)
		.where('book.hidden', '=', false)
		.where('series.hidden', '=', false)
		.where('user_list_series.user_id', '=', listUser.id)
		.where('release.release_date', '>=', getTodayAsDateNumber())
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
		)
		.distinctOn('release.id')
		.selectAll('release')
		.$if(isMyList, (qb) =>
			qb.select((eb) =>
				jsonObjectFrom(
					eb
						.selectFrom('user_list_release')
						.whereRef('user_list_release.release_id', '=', 'release.id')
						.where('user_list_release.user_id', '=', listUser.id)
						.select('user_list_release.release_status'),
				).as('user_list_release'),
			),
		);

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

	const queryOrdered = db
		.with('query', () => query)
		.selectFrom('query')
		.orderBy(['query.release_date asc', 'query.id', 'query.format'])
		.selectAll();

	const releases = await queryOrdered.execute();

	const groupedReleases = groupBy(releases, (v) => {
		const dateNumber = new DateNumber(v.release_date);
		const month = dateNumber.getMonth();
		const year = dateNumber.getYear();
		return `${month}|${year}`;
	});

	const userListReleaseForm = await superValidate(zod(userListReleaseSchema));

	const dateNumber = new DateNumber(DateNumberGenerator.fromToday().date);
	const currentYearMonth = `${dateNumber.getYear()}-${dateNumber.getMonth()}`;

	return {
		isMyList,
		listUser,
		groupedReleases,
		userListReleaseForm: isMyList ? userListReleaseForm : undefined,
		filtersFormObj: formObj,
		currentYearMonth,
	};
};
