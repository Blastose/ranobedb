import { addCharacterBetweenString } from '$lib/db/match.js';
import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { getUserLabelCounts, getUserListCounts } from '$lib/server/db/user/list';
import { DBUsers } from '$lib/server/db/user/user.js';
import { listLabelsSchema, pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { sql } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, params, locals }) => {
	const user = locals.user;
	const userIdNumeric = Number(params.id);
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;
	const listLabels = await superValidate(url, zod(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : [];

	const listUser = await new DBUsers(db).getUserByIdNumbericSafe(userIdNumeric);

	if (!listUser) {
		error(404);
	}

	const userLabelCounts = await getUserLabelCounts(listUser.id).execute();

	const dbBooks = DBBooks.fromDB(db);

	let query = dbBooks.getBooksUser(listUser.id, labels);
	query = query
		.where('cte_book.hidden', '=', false)
		.orderBy((eb) => sql`${eb.fn.coalesce('cte_book.romaji', 'cte_book.title')} COLLATE numeric`);
	if (q) {
		query = query.where((eb) =>
			eb.or([
				eb('cte_book.title', 'ilike', addCharacterBetweenString(q, '%')),
				eb('cte_book.romaji', 'ilike', addCharacterBetweenString(q, '%')),
			]),
		);
	}

	const [{ result: books, count, totalPages }, listCounts] = await Promise.all([
		paginationBuilderExecuteWithCount(query, {
			limit: 24,
			page: currentPage,
		}),
		getUserListCounts({ userId: listUser.id }),
	]);

	return {
		books,
		count,
		currentPage,
		totalPages,
		userLabelCounts,
		isMyList: user?.id_numeric === userIdNumeric,
		listUser,
		labels,
		listCounts,
	};
};
