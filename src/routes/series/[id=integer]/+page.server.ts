import { getDisplayPrefsUser, getTitleDisplay } from '$lib/display/prefs.js';
import { DBChanges } from '$lib/server/db/change/change.js';
import { db } from '$lib/server/db/db.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const id = Number(params.id);
	const dbSeries = DBSeries.fromDB(db, locals.user);
	const series = await dbSeries.getSeriesOne(id).executeTakeFirst();

	if (!series) {
		error(404);
	}

	await new DBChanges(db).itemHiddenError({
		item: series,
		itemId: id,
		itemName: 'series',
		title: getTitleDisplay({ obj: series, prefs: getDisplayPrefsUser(locals.user).title_prefs }),
		user: locals.user,
	});

	return {
		series,
	};
};
