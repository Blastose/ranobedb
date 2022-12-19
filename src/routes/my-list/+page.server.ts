import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, '/login');
	}

	const labelParamFilter = url.searchParams.get('q');
	let labelFilter = '';
	if (!(labelParamFilter === 'All' || labelParamFilter === null)) {
		labelFilter = labelParamFilter;
	}

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
		.select(['added_date', 'start_date', 'finish_date', 'label_name'])
		.where('user.id', '=', session.userId)
		.if(Boolean(labelFilter), (qb) => qb.where('reader_labels.label_name', '=', labelFilter))
		.orderBy('reads.finish_date')
		.execute();

	if (!reads) {
		throw error(500);
	}
	return { reads };
};
