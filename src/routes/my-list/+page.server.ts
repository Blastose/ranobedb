import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { sql } from 'kysely';
import { getPaginationFromUrl } from '$lib/util/getPaginationFromUrl';

export const load = (async ({ locals, url }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const labelParamFilter = url.searchParams.get('q');
	let labelFilter = '';
	if (!(labelParamFilter === 'All' || labelParamFilter === null)) {
		labelFilter = labelParamFilter;
	}
	const { limit, page } = getPaginationFromUrl(url);

	const reads = await db
		.selectFrom('user')
		.innerJoin('reads', 'user.reader_id', 'reads.reader_id')
		.innerJoin('book_info', 'book_info.id', 'reads.book_id')
		.innerJoin('reader_labels', (join) =>
			join
				.onRef('reader_labels.reader_id', '=', 'reads.reader_id')
				.onRef('reads.book_id', '=', 'reader_labels.book_id')
		)
		.selectAll('book_info')
		.select(sql<string>`count(*) over()`.as('count'))
		.select(['added_date', 'start_date', 'finish_date', 'label_name'])
		.where('user.id', '=', session.userId)
		.$if(Boolean(labelFilter), (qb) => qb.where('reader_labels.label_name', '=', labelFilter))
		.orderBy('reads.finish_date')
		.limit(limit)
		.offset(limit * (page - 1))
		.execute();

	if (!reads) {
		throw error(500);
	}

	let count = 0;
	if (reads.length > 0) {
		count = Number(reads[0].count);
	}

	return { reads, count, totalPages: Math.ceil(count / limit) };
}) satisfies PageServerLoad;
