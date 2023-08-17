import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { sql } from 'kysely';

export const load = (async ({ locals, url }) => {
	const session = await locals.auth.validate();
	const user = session?.user;
	if (!user) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const { count } = db.fn;

	const readPerMonthPromise = sql<{ date: string; count: string }>`
	SELECT date_trunc('month', gs)::date AS date, COALESCE(COUNT(book_id), 0) AS count FROM
		generate_series(date_trunc('month', 'now'::date)::date - '11 month'::interval, date_trunc('month', 'now'::date)::date, interval '1 month') AS gs
		LEFT JOIN reads ON date_trunc('month', reads.finish_date)::date = date_trunc('month', gs)::date AND reads.reader_id = ${user.readerId}
		GROUP BY date
		ORDER BY date
	`.execute(db);

	const readLabelsPromise = db
		.selectFrom('reads')
		.innerJoin('reader_labels', (join) =>
			join
				.onRef('reader_labels.reader_id', '=', 'reads.reader_id')
				.onRef('reads.book_id', '=', 'reader_labels.book_id')
		)
		.where('reads.reader_id', '=', user.readerId)
		.select('reader_labels.label_name')
		.select(count<string>('reader_labels.label_name').as('count'))
		.groupBy('reader_labels.label_name')
		.execute();

	const [readPerMonth, readLabels] = await Promise.all([readPerMonthPromise, readLabelsPromise]);
	return { readPerMonth: readPerMonth.rows, readLabels, user };
}) satisfies PageServerLoad;
