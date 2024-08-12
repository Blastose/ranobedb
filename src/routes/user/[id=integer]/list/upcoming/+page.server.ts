import { DateNumber, getTodayAsDateNumber } from '$lib/components/form/release/releaseDate.js';
import { groupBy } from '$lib/db/array.js';
import { db } from '$lib/server/db/db';
import { DBUsers } from '$lib/server/db/user/user.js';
import { releaseFiltersSchema, userListReleaseSchema } from '$lib/server/zod/schema.js';
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

	return {
		isMyList,
		listUser,
		groupedReleases,
		userListReleaseForm: isMyList ? userListReleaseForm : undefined,
		filtersForm: form,
	};
};
