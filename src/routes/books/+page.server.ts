import { DBBooks } from '$lib/server/db/books/books.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers';
import { bookFiltersSchema, pageSchema, qSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, sql, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const form = await superValidate(url, zod(bookFiltersSchema));

	const user = locals.user;
	const dbBooks = DBBooks.fromDB(db, user);
	let query = dbBooks.getBooks().where('cte_book.hidden', '=', false);

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_book.romaji', 'cte_book.title')} COLLATE numeric asc`,
		);
	} else if (sort === 'Title desc') {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_book.romaji', 'cte_book.title')} COLLATE numeric desc`,
		);
	} else if (sort === 'Release date asc') {
		query = query.orderBy('cte_book.release_date asc');
	} else if (sort === 'Release date desc') {
		query = query.orderBy('cte_book.release_date desc');
	} else if (sort.startsWith('Relevance') && useQuery) {
		const orderByDirection = sort.split(' ').slice(-1)[0] as 'asc' | 'desc';
		query = query
			.innerJoin('book_title', 'book_title.book_id', 'cte_book.id')
			.select((eb) =>
				eb.fn
					.max(
						eb.fn('greatest', [
							eb.fn('word_similarity', [eb.val(q), eb.ref('book_title.title')]),
							eb.fn('word_similarity', [eb.val(q), eb.ref('book_title.romaji')]),
						]),
					)
					.as('sim_score'),
			)
			.where((eb) =>
				eb.or([
					eb(eb.val(q), sql.raw('<%'), eb.ref('book_title.title')).$castTo<boolean>(),
					eb(eb.val(q), sql.raw('<%'), eb.ref('book_title.romaji')).$castTo<boolean>(),
				]),
			)
			.having(
				(eb) =>
					eb.fn.max(
						eb.fn('greatest', [
							eb.fn('word_similarity', [eb.val(q), eb.ref('book_title.title')]),
							eb.fn('word_similarity', [eb.val(q), eb.ref('book_title.romaji')]),
						]),
					),
				'>',
				0.3,
			)
			.orderBy(`sim_score ${orderByDirection}`);
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_book.romaji', 'cte_book.title')} COLLATE numeric asc`,
		);
		query = query.groupBy([
			'cte_book.id',
			'cte_book.image_id',
			'cte_book.lang',
			'cte_book.romaji',
			'cte_book.romaji_orig',
			'cte_book.title',
			'cte_book.title_orig',
			'cte_book.release_date',
			'cte_book.olang',
		]);
	}

	if (
		(sort !== 'Title asc' && sort !== 'Title desc') ||
		(sort.startsWith('Relevance') && !useQuery)
	) {
		query = query.orderBy(
			(eb) => sql`${eb.fn.coalesce('cte_book.romaji', 'cte_book.title')} COLLATE numeric asc`,
		);
	}

	if (useQuery || useReleaseLangFilters || useReleaseFormatFilters) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb('cte_book.id', 'in', (eb) =>
				eb
					.selectFrom('book')
					.distinctOn('book.id')
					.select('book.id')
					.$if(useQuery && !sort.startsWith('Relevance'), (qb) =>
						qb
							.innerJoin('book_title', (join) => join.onRef('book_title.book_id', '=', 'book.id'))
							.where((eb) =>
								eb.or([
									eb(eb.val(q), sql.raw('<%'), eb.ref('book_title.title')).$castTo<boolean>(),
									eb(eb.val(q), sql.raw('<%'), eb.ref('book_title.romaji')).$castTo<boolean>(),
								]),
							)
							.having(
								(eb) =>
									eb.fn.max(
										eb.fn('greatest', [
											eb.fn('word_similarity', [eb.val(q), eb.ref('book_title.title')]),
											eb.fn('word_similarity', [eb.val(q), eb.ref('book_title.romaji')]),
										]),
									),
								'>',
								0.3,
							)
							.groupBy('book.id'),
					)
					.$if(useReleaseLangFilters, (qb) =>
						qb
							.innerJoin('release_book', (join) =>
								join.onRef('release_book.book_id', '=', 'book.id'),
							)
							.innerJoin('release', (join) =>
								join.onRef('release.id', '=', 'release_book.release_id'),
							)
							.$if(form.data.rll === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const lang of form.data.rl) {
										filters.push(eb2('release.lang', '=', lang));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.rll === 'and', (qb2) =>
								qb2
									.where('release.lang', 'in', form.data.rl)
									.groupBy('book.id')
									.having((eb) => eb.fn.count('release.lang').distinct(), '=', form.data.rl.length),
							),
					)
					.$if(useReleaseFormatFilters, (qb) =>
						qb
							.innerJoin('release_book', (join) =>
								join.onRef('release_book.book_id', '=', 'book.id'),
							)
							.innerJoin('release', (join) =>
								join.onRef('release.id', '=', 'release_book.release_id'),
							)
							.$if(form.data.rfl === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const format of form.data.rf) {
										filters.push(eb2('release.format', '=', format));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.rfl === 'and', (qb2) =>
								qb2
									.where('release.format', 'in', form.data.rf)
									.groupBy('book.id')
									.having(
										(eb) => eb.fn.count('release.format').distinct(),
										'=',
										form.data.rf.length,
									),
							),
					),
			),
		);
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		books,
		count,
		currentPage,
		totalPages,
		filtersForm: form,
	};
};
