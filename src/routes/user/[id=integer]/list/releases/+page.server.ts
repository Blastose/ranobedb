import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import {
	pageSchema,
	qSchema,
	releaseFiltersObjSchema,
	releaseFiltersSchema,
	userListReleaseSchema,
} from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import type { Expression, SqlBool } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;
	const user = locals.user;
	const form = await superValidate(url, zod(releaseFiltersSchema));
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

	const userListReleaseForm = await superValidate(zod(userListReleaseSchema));
	const userIdNumeric = Number(params.id);
	const isMyList = user?.id_numeric === userIdNumeric;

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const dbBooks = DBBooks.fromDB(db);

	const query = dbBooks
		.getBooksUser({ userId: listUser.id, labelIds: [] })
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('release')
					.selectAll('release')
					.innerJoin('release_book', (join) =>
						join
							.onRef('release_book.release_id', '=', 'release.id')
							.onRef('release_book.book_id', '=', 'cte_book.id'),
					)
					.innerJoin('user_list_release', 'user_list_release.release_id', 'release.id')
					.where('user_list_release.user_id', '=', listUser.id)
					.where('release.hidden', '=', false)
					.select((eb) =>
						jsonObjectFrom(
							eb
								.selectFrom('user_list_release')
								.select('user_list_release.release_status')
								.whereRef('user_list_release.release_id', '=', 'release.id')
								.where('user_list_release.user_id', '=', listUser.id),
						).as('user_list_release'),
					)
					.orderBy(['release.lang', 'release.format', 'release.release_date']),
			).as('releases'),
		])
		.innerJoin('series_book', 'series_book.book_id', 'cte_book.id')
		.innerJoin('series', 'series.id', 'series_book.series_id')
		.where('cte_book.hidden', '=', false)
		.where('series.hidden', '=', false)
		.where((eb) =>
			eb(
				'cte_book.id',
				'in',
				eb
					.selectFrom('release')
					.innerJoin('release_book', (join) =>
						join
							.onRef('release_book.release_id', '=', 'release.id')
							.onRef('release_book.book_id', '=', 'cte_book.id'),
					)
					.select('release_book.book_id')
					.innerJoin('user_list_release', 'user_list_release.release_id', 'release.id')
					.where('user_list_release.user_id', '=', listUser.id)
					.where('release.hidden', '=', false)
					.$if(Boolean(q), (qb) =>
						qb.where((eb) =>
							eb.or([
								eb('release.title', 'ilike', `%${q}%`),
								eb('release.romaji', 'ilike', `%${q}%`),
							]),
						),
					)
					.$if(form.data.rl.length > 0, (qb) =>
						qb.where((eb) => {
							const filters: Expression<SqlBool>[] = [];
							for (const lang of form.data.rl) {
								filters.push(eb('release.lang', '=', lang));
							}
							return eb.or(filters);
						}),
					)
					.$if(form.data.rf.length > 0, (qb) =>
						qb.where((eb) => {
							const filters: Expression<SqlBool>[] = [];
							for (const format of form.data.rf) {
								filters.push(eb('release.format', '=', format));
							}
							return eb.or(filters);
						}),
					)
					.$if(form.data.p.length > 0, (qb) =>
						qb
							.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
							// Here we only use 'or' logic for the publishers because the current method for 'and' uses a group by
							// which doesn't work with this subquery select (book_id)
							.$if(Boolean(form.data.pl), (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const publisher_id of form.data.p) {
										filters.push(eb2('release_publisher.publisher_id', '=', publisher_id));
									}
									return eb2.or(filters);
								}),
							),
					)
					.$if(form.data.l.length > 0, (qb) =>
						qb.where('user_list_release.release_status', 'in', form.data.l),
					),
			),
		)
		.clearOrderBy()
		.orderBy(['series_book.series_id', 'series_book.sort_order']);

	// TODO This could probably be better instead of two separate queries with repeated stuff
	const countQuery = db
		.selectFrom('release')
		.select((eb) => eb.fn.count<string>('release.id').as('count'))
		.innerJoin('user_list_release', 'user_list_release.release_id', 'release.id')
		.where('user_list_release.user_id', '=', listUser.id)
		.where('release.hidden', '=', false)
		.$if(Boolean(q), (qb) =>
			qb.where((eb) =>
				eb.or([eb('release.title', 'ilike', `%${q}%`), eb('release.romaji', 'ilike', `%${q}%`)]),
			),
		)
		.$if(form.data.rl.length > 0, (qb) =>
			qb.where((eb) => {
				const filters: Expression<SqlBool>[] = [];
				for (const lang of form.data.rl) {
					filters.push(eb('release.lang', '=', lang));
				}
				return eb.or(filters);
			}),
		)
		.$if(form.data.rf.length > 0, (qb) =>
			qb.where((eb) => {
				const filters: Expression<SqlBool>[] = [];
				for (const format of form.data.rf) {
					filters.push(eb('release.format', '=', format));
				}
				return eb.or(filters);
			}),
		)
		.$if(form.data.p.length > 0, (qb) =>
			qb
				.innerJoin('release_publisher', 'release_publisher.release_id', 'release.id')
				// Same reason as above
				.$if(Boolean(form.data.pl), (qb2) =>
					qb2.where((eb2) => {
						const filters: Expression<SqlBool>[] = [];
						for (const publisher_id of form.data.p) {
							filters.push(eb2('release_publisher.publisher_id', '=', publisher_id));
						}
						return eb2.or(filters);
					}),
				),
		)
		.$if(form.data.l.length > 0, (qb) =>
			qb.where('user_list_release.release_status', 'in', form.data.l),
		);

	const [{ result: bookWithReleasesInList, totalPages }, listCounts, releaseCounts] =
		await Promise.all([
			paginationBuilderExecuteWithCount(query, {
				limit: 24,
				page: currentPage,
			}),
			getUserListCounts({ userId: listUser.id }),
			countQuery.executeTakeFirstOrThrow(),
		]);

	return {
		isMyList,
		listUser,
		bookWithReleasesInList,
		userListReleaseForm: isMyList ? userListReleaseForm : undefined,
		listCounts,
		count: releaseCounts.count,
		totalPages,
		currentPage,
		filtersFormObj: formObj,
	};
};
