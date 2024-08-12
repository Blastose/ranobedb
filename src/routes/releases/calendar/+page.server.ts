import { DateNumber, DateNumberGenerator } from '$lib/components/form/release/releaseDate.js';
import { groupBy } from '$lib/db/array.js';
import { db } from '$lib/server/db/db.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import {
	pageSchema,
	qSchema,
	releaseFiltersCalendarSchema,
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

	if (useQuery || useReleaseLangFilters || useReleaseFormatFilters) {
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
		filtersForm: form,
		userListReleaseForm,
		nextMonth,
		prevMonth,
		currentMonth,
		month,
		year,
		count: releases.length,
	};
};
