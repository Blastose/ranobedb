import { DBChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { db } from '$lib/server/db/db.js';
import { type Diff } from '$lib/components/history/utils.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';
import { getSeriesDiffs } from '$lib/server/db/series/diff.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const seriesId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const dbSeries = DBSeries.fromDB(db, locals.user);
	const seriesPromise = dbSeries
		.getSeriesHistOne({ id: seriesId, revision: revision })
		.executeTakeFirst();
	const changesPromise = new DBChanges(db)
		.getChanges('series', seriesId, [previousRevision, revision, revision + 1])
		.execute();

	const [series, changes, currentSeriesVisibility, prevSeriesHistEdit, seriesHistEdit] =
		await Promise.all([
			seriesPromise,
			changesPromise,
			db
				.selectFrom('series')
				.where('series.id', '=', seriesId)
				.select(['hidden', 'locked'])
				.limit(1)
				.executeTakeFirst(),
			previousRevision > 0
				? dbSeries
						.getSeriesHistOneEdit({
							id: seriesId,
							revision: previousRevision,
						})
						.executeTakeFirst()
				: undefined,
			previousRevision > 0
				? dbSeries.getSeriesHistOneEdit({ id: seriesId, revision }).executeTakeFirst()
				: undefined,
		]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!series || !currentSeriesVisibility) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(currentSeriesVisibility);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/series/${seriesId}`);
		}
	}

	let diffs: Diff[] = [];
	const titlePrefs = getDisplayPrefsUser(locals?.user).title_prefs;
	if (previousRevision > 0) {
		if (!prevSeriesHistEdit || !seriesHistEdit) {
			error(404);
		}

		diffs = getSeriesDiffs({ prevSeriesHistEdit, seriesHistEdit, titlePrefs });
	}

	return {
		seriesId,
		series,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
		currentItemVisibility: currentSeriesVisibility,
	};
};
