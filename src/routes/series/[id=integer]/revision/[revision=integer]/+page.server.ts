import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { detailedDiff } from 'deep-object-diff';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { getSeriesHistOne } from '$lib/server/db/series/series.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const seriesId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const seriesPromise = getSeriesHistOne({ id: seriesId, revision: revision }).executeTakeFirst();
	const changesPromise = getChanges('series', seriesId, [
		previousRevision,
		revision,
		revision + 1
	]).execute();

	const [series, changes] = await Promise.all([seriesPromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	console.log(series);
	if (!series) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(series);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/series/${seriesId}`);
		}
	}
	let diff;
	if (previousRevision > 0) {
		const prevSeries = await getSeriesHistOne({
			id: seriesId,
			revision: previousRevision
		}).executeTakeFirst();
		if (!prevSeries) {
			error(404);
		}
		// TODO diff these better
		diff = detailedDiff(prevSeries, series);
	}

	return {
		seriesId,
		series,
		diff,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange }
	};
};
