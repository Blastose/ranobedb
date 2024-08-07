import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { getUserListCounts } from '$lib/server/db/user/list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { pageSchema, qSchema, userListReleaseSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const dbBooks = DBBooks.fromDB(db);

	let query = dbBooks
		.getBooksUser(listUser.id, [])
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
		.clearOrderBy()
		.orderBy(['series_book.series_id', 'series_book.sort_order']);

	if (q) {
		query = query.where((eb) =>
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
					.where((eb) =>
						eb.or([
							eb('release.title', 'ilike', `%${q}%`),
							eb('release.romaji', 'ilike', `%${q}%`),
						]),
					),
			),
		);
	}

	const {
		result: bookWithReleasesInList,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	const userListReleaseForm = await superValidate(zod(userListReleaseSchema));

	const isMyList = user?.id_numeric === userIdNumeric;
	const listCounts = await getUserListCounts({ userId: listUser.id });

	return {
		isMyList,
		listUser,
		bookWithReleasesInList,
		userListReleaseForm: isMyList ? userListReleaseForm : undefined,
		listCounts,
		count,
		totalPages,
		currentPage,
	};
};
