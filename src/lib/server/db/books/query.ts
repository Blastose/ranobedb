import { listLabelsSchema, bookFiltersObjSchema, bookFiltersSchema } from '$lib/server/zod/schema';
import { superValidate, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { DBBooks } from './books';
import { DeduplicateJoinsPlugin, sql, type Expression, type Kysely, type SqlBool } from 'kysely';
import type { DB } from '../dbTypes';
import type { User } from '$lib/server/lucia/lucia';
import { zod4 } from 'sveltekit-superforms/adapters';
import { paginationBuilderExecuteWithCount } from '../dbHelpers';
import { getUserBookLabels } from '../user/list';
import { dateStringToNumber } from '$lib/components/form/release/releaseDate';
import { normalizeTitle } from '$lib/utils/title';

export async function getBooks(params: {
	limit: number;
	currentPage: number;
	q: string | undefined | null;
	db: Kysely<DB>;
	listUser: Pick<User, 'id'> | null;
	currentUser: User | null;
	url: URL | URLSearchParams;
	form: SuperValidated<Infer<typeof bookFiltersSchema>>;
	isList?: boolean;
}) {
	const { currentPage, db, listUser, currentUser, url, form, limit, isList } = params;
	let { q } = params;
	q = normalizeTitle(q);

	const dbBooks = DBBooks.fromDB(db, currentUser);

	const listLabels = await superValidate(url, zod4(listLabelsSchema));
	const labels = listLabels.valid ? listLabels.data.l : undefined;

	let query = dbBooks
		.getBooks({ q, listStatus: form.data.list, userId: listUser?.id, labelIds: labels, isList })
		.where('cte_book.hidden', '=', false);

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseLangExcludeFilters = form.data.rlExclude.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;
	const useStaffFilters = form.data.staff.length > 0;
	const usePublisherFilters = form.data.p.length > 0;

	const [staff_aliases, publishers, staff_ids] = await Promise.all([
		await db
			.selectFrom('staff_alias')
			.innerJoin('staff', 'staff.id', 'staff_alias.staff_id')
			.where('staff.hidden', '=', false)
			.where('staff_alias.id', 'in', form.data.staff.length > 0 ? form.data.staff : [-1])
			.select(['staff_alias.id', 'staff_alias.name', 'staff_alias.romaji'])
			.execute(),
		await db
			.selectFrom('publisher')
			.where('publisher.hidden', '=', false)
			.where('publisher.id', 'in', form.data.p.length > 0 ? form.data.p : [-1])
			.select(['publisher.id', 'publisher.name', 'publisher.romaji'])
			.execute(),
		await db
			.selectFrom('staff')
			.innerJoin('staff_alias', 'staff_alias.staff_id', 'staff.id')
			.where('staff_alias.id', 'in', form.data.staff.length > 0 ? form.data.staff : [-1])
			.groupBy('staff.id')
			.select('staff.id')
			.execute(),
	]);

	staff_aliases.sort((a, b) => form.data.staff.indexOf(a.id) - form.data.staff.indexOf(b.id));
	publishers.sort((a, b) => form.data.p.indexOf(a.id) - form.data.p.indexOf(b.id));

	const formObj = await superValidate(
		{ ...form.data, staff: staff_aliases, p: publishers },
		zod4(bookFiltersObjSchema),
	);

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy(
			(eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'),
			(ob) => ob.collate('numeric').asc(),
		);
	} else if (sort === 'Title desc') {
		query = query.orderBy(
			(eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'),
			(ob) => ob.collate('numeric').desc(),
		);
	} else if (sort === 'Release date asc') {
		query = query.orderBy('cte_book.c_release_date', 'asc');
	} else if (sort === 'Release date desc') {
		query = query.orderBy('cte_book.c_release_date', 'desc');
	} else if (sort === 'Score asc' && listUser !== null) {
		query = query.orderBy('score', 'asc');
	} else if (sort === 'Score desc' && listUser !== null) {
		query = query.orderBy('score', (ob) => ob.desc().nullsLast());
	} else if (sort === 'Added asc' && listUser !== null) {
		query = query.orderBy('added', 'asc');
	} else if (sort === 'Added desc' && listUser !== null) {
		query = query.orderBy('added', 'desc');
	} else if (sort === 'Last updated asc' && listUser !== null) {
		query = query.orderBy('last_updated', 'asc');
	} else if (sort === 'Last updated desc' && listUser !== null) {
		query = query.orderBy('last_updated', 'desc');
	} else if (sort === 'Started asc' && listUser !== null) {
		query = query.orderBy('started', (ob) => ob.asc().nullsLast());
	} else if (sort === 'Started desc' && listUser !== null) {
		query = query.orderBy('started', (ob) => ob.desc().nullsLast());
	} else if (sort === 'Finished asc' && listUser !== null) {
		query = query.orderBy('finished', (ob) => ob.asc().nullsLast());
	} else if (sort === 'Finished desc' && listUser !== null) {
		query = query.orderBy('finished', (ob) => ob.desc().nullsLast());
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
			.orderBy('sim_score', orderByDirection)
			.orderBy(
				(eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'),
				(ob) => ob.collate('numeric').asc(),
			);
		if (isList) {
			query = query.groupBy([
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.c_release_date',
				'cte_book.olang',
				'score',
				'last_updated',
				'added',
				'started',
				'finished',
			]);
		} else {
			query = query.groupBy([
				'cte_book.id',
				'cte_book.image_id',
				'cte_book.lang',
				'cte_book.romaji',
				'cte_book.romaji_orig',
				'cte_book.title',
				'cte_book.title_orig',
				'cte_book.c_release_date',
				'cte_book.olang',
			]);
		}
	}

	if (
		(sort !== 'Title asc' && sort !== 'Title desc') ||
		(sort.startsWith('Relevance') && !useQuery)
	) {
		query = query.orderBy(
			(eb) => eb.fn.coalesce('cte_book.romaji', 'cte_book.title'),
			(ob) => ob.collate('numeric').asc(),
		);
	}

	if (
		useReleaseLangFilters ||
		useReleaseLangExcludeFilters ||
		useReleaseFormatFilters ||
		useStaffFilters ||
		usePublisherFilters
	) {
		query = query.withPlugin(new DeduplicateJoinsPlugin()).where((eb) =>
			eb('cte_book.id', 'in', (eb) =>
				eb
					.selectFrom('book')
					.distinctOn('book.id')
					.select('book.id')
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
					.$if(useReleaseLangExcludeFilters, (qb) => {
						let ex_qb = qb
							.innerJoin('release_book as rb_ex', 'rb_ex.book_id', 'book.id')
							.innerJoin('release as r_ex', 'r_ex.id', 'rb_ex.release_id')
							.groupBy('book.id');
						for (const ex_lang of form.data.rlExclude) {
							ex_qb = ex_qb.having(
								(eb) =>
									eb.fn
										.count((eb2) => eb2.case().when('r_ex.lang', '=', ex_lang).then(1).end())
										.distinct(),
								'=',
								0,
							);
						}
						return ex_qb;
					})
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
					)
					.$if(useStaffFilters, (qb) =>
						qb
							.innerJoin('book_staff_alias', (join) =>
								join.onRef('book_staff_alias.book_id', '=', 'book.id'),
							)
							.innerJoin('staff_alias', 'staff_alias.id', 'book_staff_alias.staff_alias_id')
							.$if(form.data.sl === 'or', (qb2) =>
								qb2.where((eb2) => {
									const filters: Expression<SqlBool>[] = [];
									for (const staff of staff_ids) {
										filters.push(eb2('staff_alias.staff_id', '=', staff.id));
									}
									return eb2.or(filters);
								}),
							)
							.$if(form.data.sl === 'and', (qb2) =>
								qb2
									.where(
										'staff_alias.staff_id',
										'in',
										staff_ids.map((v) => v.id),
									)
									.groupBy('book.id')
									.having(
										(eb) => eb.fn.count('staff_alias.staff_id').distinct(),
										'=',
										staff_ids.length,
									),
							),
					)
					.$if(usePublisherFilters, (qb) =>
						qb
							.innerJoin('release_book as rb_p', (join) =>
								join.onRef('rb_p.book_id', '=', 'book.id'),
							)
							.innerJoin('release as r_p', (join) => join.onRef('r_p.id', '=', 'rb_p.release_id'))
							.innerJoin('release_publisher', 'release_publisher.release_id', 'r_p.id')
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
									.groupBy('book.id')
									.having(
										(eb) => eb.fn.count('release_publisher.publisher_id').distinct(),
										'=',
										form.data.p.length,
									),
							),
					),
			),
		);
	}

	if (form.data.minDate) {
		query = query.where('cte_book.c_release_date', '>=', dateStringToNumber(form.data.minDate));
	}
	if (form.data.maxDate) {
		query = query.where('cte_book.c_release_date', '<=', dateStringToNumber(form.data.maxDate));
	}

	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: limit,
		page: currentPage,
	});

	const allCustLabels = listUser ? await getUserBookLabels(listUser.id, true) : [];

	return {
		books,
		count,
		currentPage,
		totalPages,
		filtersFormObj: formObj,
		allCustLabels,
	};
}
