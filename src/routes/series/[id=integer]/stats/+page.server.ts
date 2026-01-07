import { DBSeries } from '$lib/server/db/series/series.js';
import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { statsFiltersSchema } from '$lib/server/zod/schema.js';
import { pageSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const id = params.id;
	const seriesId = Number(id);
	const page = await superValidate(url, zod4(pageSchema));
	const currentPage = page.data.page;
	const form = await superValidate(url, zod4(statsFiltersSchema));

	let query = db
		.selectFrom('user_list_series')
		.innerJoin('auth_user', 'auth_user.id', 'user_list_series.user_id')
		.innerJoin('user_list_series_label', (where) =>
			where
				.onRef('user_list_series_label.series_id', '=', 'user_list_series.series_id')
				.onRef('user_list_series_label.user_id', '=', 'auth_user.id')
				.on('user_list_series_label.label_id', '<=', 10),
		)
		.leftJoin('profile_image', 'auth_user.profile_image_id', 'profile_image.id')
		.where('user_list_series.series_id', '=', seriesId)
		.select([
			'user_list_series.last_updated',
			'auth_user.username',
			'auth_user.id_numeric',
			'user_list_series_label.label_id',
			'profile_image.filename',
		])
		.select((eb) => eb(eb.cast('user_list_series.score', 'float4'), '/', 10).as('score'));

	if (form.data.has_score) {
		query = query.where('user_list_series.score', 'is not', null);
	}
	if (form.data.reading_status.length > 0) {
		query = query.where('user_list_series_label.label_id', 'in', form.data.reading_status);
	}
	if (form.data.sort === 'Last updated asc') {
		query = query.orderBy('user_list_series.last_updated', 'asc');
	} else if (form.data.sort === 'Last updated desc') {
		query = query.orderBy('user_list_series.last_updated', 'desc');
	} else if (form.data.sort === 'Reading status asc') {
		query = query.orderBy('user_list_series_label.label_id', 'asc');
	} else if (form.data.sort === 'Reading status desc') {
		query = query.orderBy('user_list_series_label.label_id', 'desc');
	} else if (form.data.sort === 'Score asc') {
		query = query.orderBy('user_list_series.score', 'asc');
	} else if (form.data.sort === 'Score desc') {
		query = query.orderBy('user_list_series.score', 'desc');
	}
	query = query.orderBy('user_list_series.last_updated', 'desc');

	const {
		result: stats,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 50,
		page: currentPage,
	});

	const user = locals.user;
	const dbSeries = DBSeries.fromDB(db, user);
	const series = await dbSeries
		.getSeriesOne(seriesId)
		.clearSelect()
		.select([
			'cte_series.title',
			'cte_series.romaji',
			'cte_series.title_orig',
			'cte_series.romaji_orig',
			'cte_series.lang',
			'cte_series.id',
		])
		.executeTakeFirstOrThrow();
	if (!series) {
		error(404);
	}

	return { stats, series, count, currentPage, totalPages, form };
};
