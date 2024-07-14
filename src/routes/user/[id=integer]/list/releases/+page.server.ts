import { db } from '$lib/server/db/db';
import { getBooksRL } from '$lib/server/db/user/list.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { userListReleaseSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const query = getBooksRL(listUser.id, user)
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
		.clearOrderBy()
		.orderBy(['series_book.series_id', 'series_book.sort_order']);

	const bookWithReleasesInList = await query.execute();
	const userListReleaseForm = await superValidate(zod(userListReleaseSchema));

	const isMyList = user?.id_numeric === userIdNumeric;

	return {
		isMyList,
		listUser,
		bookWithReleasesInList,
		userListReleaseForm: isMyList ? userListReleaseForm : undefined,
	};
};
